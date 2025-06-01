module suisays::suisays {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use std::string::{String};

    // Error codes
    const EInvalidVoteType: u64 = 501;
    const EPostNotFound: u64 = 502;
    const ECommentNotFound: u64 = 503;

    // Vote types
    const VOTE_AGREE: u8 = 1;
    const VOTE_DISAGREE: u8 = 2;

    public struct SuiSaysRegistry has key, store {
        id: UID,
        posts: Table<String, SuiSaysPost>,
        post_count: u64,
    }

    public struct SuiSaysPost has store {
        content: String,
        author: address,
        created_at: u64,
        agree_count: u64,
        disagree_count: u64,
        total_donations: u64,
        voters: Table<address, u8>,
        comment_count: u64,
        comments: Table<String, SuiSaysComment>,
    }

    public struct SuiSaysComment has store {
        content: String,
        author: address,
        created_at: u64,
        vote_side: u8, // VOTE_AGREE or VOTE_DISAGREE
        back_count: u64,
        backers: Table<address, bool>,
    }

    // Initialize the registry
    fun init(ctx: &mut TxContext) {
        let registry = SuiSaysRegistry {
            id: object::new(ctx),
            posts: table::new(ctx),
            post_count: 0,
        };
        transfer::share_object(registry);
    }

    // Helper function to convert u64 to string
    fun u64_to_string(value: u64): String {
        if (value == 0) {
            return std::string::utf8(b"0")
        };
        
        let mut digits = vector::empty<u8>();
        let mut n = value;
        
        while (n > 0) {
            let digit = ((n % 10) as u8) + 48; // 48 is ASCII '0'
            vector::push_back(&mut digits, digit);
            n = n / 10;
        };
        
        vector::reverse(&mut digits);
        std::string::utf8(digits)
    }

    // Create a new post
    public entry fun create_post(
        registry: &mut SuiSaysRegistry,
        content: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        registry.post_count = registry.post_count + 1;
        let post_id = u64_to_string(registry.post_count); // Creates "1", "2", "3", etc.
        
        let post = SuiSaysPost {
            content,
            author: sender,
            created_at: timestamp,
            agree_count: 0,
            disagree_count: 0,
            total_donations: 0,
            voters: table::new(ctx),
            comment_count: 0,
            comments: table::new(ctx),
        };
        
        table::add(&mut registry.posts, post_id, post);
    }

    public entry fun add_comment(
        registry: &mut SuiSaysRegistry,
        post_id: String,
        content: String,
        vote_side: u8,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(vote_side == VOTE_AGREE || vote_side == VOTE_DISAGREE, EInvalidVoteType);
        assert!(table::contains(&registry.posts, post_id), EPostNotFound);
        
        let post = table::borrow_mut(&mut registry.posts, post_id);
        post.comment_count = post.comment_count + 1;
        let comment_id = u64_to_string(post.comment_count);
        
        let comment = SuiSaysComment {
            content,
            author: sender,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            vote_side,
            back_count: 0,
            backers: table::new(ctx),
        };
        
        table::add(&mut post.comments, comment_id, comment);
    }

    public entry fun back_comment(
        registry: &mut SuiSaysRegistry,
        post_id: String,
        comment_id: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.posts, post_id), EPostNotFound);
        
        let post = table::borrow_mut(&mut registry.posts, post_id);
        assert!(table::contains(&post.comments, comment_id), ECommentNotFound);
        
        let comment = table::borrow_mut(&mut post.comments, comment_id);
        
        if (!table::contains(&comment.backers, sender)) {
            table::add(&mut comment.backers, sender, true);
            comment.back_count = comment.back_count + 1;
        };
    }

    // Vote on a post
    public entry fun vote(
        registry: &mut SuiSaysRegistry,
        post_id: String,
        vote_type: u8,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(vote_type == VOTE_AGREE || vote_type == VOTE_DISAGREE, EInvalidVoteType);
        assert!(table::contains(&registry.posts, post_id), EPostNotFound);
        
        let post = table::borrow_mut(&mut registry.posts, post_id);

        // Handle previous votes
        if (table::contains(&post.voters, sender)) {
            let prev_vote = *table::borrow(&post.voters, sender);
            if (prev_vote == VOTE_AGREE) {
                post.agree_count = post.agree_count - 1;
            } else {
                post.disagree_count = post.disagree_count - 1;
            };
            *table::borrow_mut(&mut post.voters, sender) = vote_type;
        } else {
            table::add(&mut post.voters, sender, vote_type);
        };

        // Add new vote
        if (vote_type == VOTE_AGREE) {
            post.agree_count = post.agree_count + 1;
        } else {
            post.disagree_count = post.disagree_count + 1;
        };
    }

    // Donate to a post
    public entry fun donate(
        registry: &mut SuiSaysRegistry,
        post_id: String,
        mut donation: vector<Coin<SUI>>,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.posts, post_id), EPostNotFound);
        let post = table::borrow_mut(&mut registry.posts, post_id);
        
        let coin = vector::pop_back(&mut donation);
        let amount = coin::value(&coin);
        
        transfer::public_transfer(coin, post.author);
        post.total_donations = post.total_donations + amount;
        vector::destroy_empty(donation);
    }

    // Get post data
    public fun get_post(
        registry: &SuiSaysRegistry,
        post_id: String
    ): (String, address, u64, u64, u64, u64) {
        if (!table::contains(&registry.posts, post_id)) {
            return (std::string::utf8(b""), @0x0, 0, 0, 0, 0)
        };
        let post = table::borrow(&registry.posts, post_id);
        (post.content, post.author, post.agree_count, post.disagree_count, post.total_donations, post.created_at)
    }

    // Get most recent posts
    public fun get_recent_posts(registry: &SuiSaysRegistry, limit: u64): vector<String> {
        let mut result = vector::empty<String>();
        let mut i = registry.post_count;
        let mut count = 0;
        
        while (i > 0 && count < limit) {
            let post_id = u64_to_string(i);
            if (table::contains(&registry.posts, post_id)) {
                vector::push_back(&mut result, post_id);
                count = count + 1;
            };
            i = i - 1;
        };
        result
    }

    // Get most voted posts (by total vote count)
    public fun get_most_voted_posts(registry: &SuiSaysRegistry, limit: u64): vector<String> {
        let mut result = vector::empty<String>();
        let mut max_votes = vector::empty<u64>();
        let mut i = 1;
        
        // Find posts with highest vote counts
        while (i <= registry.post_count && vector::length(&result) < limit) {
            let post_id = u64_to_string(i);
            if (table::contains(&registry.posts, post_id)) {
                let post = table::borrow(&registry.posts, post_id);
                let total_votes = post.agree_count + post.disagree_count;
                
                if (total_votes > 0) {
                    // Simple insertion sort for top posts
                    let mut j = 0;
                    let len = vector::length(&result);
                    
                    while (j < len && *vector::borrow(&max_votes, j) >= total_votes) {
                        j = j + 1;
                    };
                    
                    if (j < limit) {
                        vector::insert(&mut result, post_id, j);
                        vector::insert(&mut max_votes, total_votes, j);
                        
                        // Keep only top N
                        if (vector::length(&result) > limit) {
                            vector::pop_back(&mut result);
                            vector::pop_back(&mut max_votes);
                        };
                    };
                };
            };
            i = i + 1;
        };
        result
    }

    public fun get_comment(
        registry: &SuiSaysRegistry,
        post_id: String,
        comment_id: String
    ): (String, address, u64, u8, u64) {
        if (!table::contains(&registry.posts, post_id)) {
            return (std::string::utf8(b""), @0x0, 0, 0, 0)
        };
        let post = table::borrow(&registry.posts, post_id);
        if (!table::contains(&post.comments, comment_id)) {
            return (std::string::utf8(b""), @0x0, 0, 0, 0)
        };
        let comment = table::borrow(&post.comments, comment_id);
        (comment.content, comment.author, comment.created_at, comment.vote_side, comment.back_count)
    }

    public fun get_recent_comments(
        registry: &SuiSaysRegistry,
        post_id: String,
        limit: u64
    ): vector<String> {
        let mut result = vector::empty<String>();
        if (!table::contains(&registry.posts, post_id)) {
            return result
        };
        
        let post = table::borrow(&registry.posts, post_id);
        let mut i = post.comment_count;
        let mut count = 0;
        
        while (i > 0 && count < limit) {
            let comment_id = u64_to_string(i);
            if (table::contains(&post.comments, comment_id)) {
                vector::push_back(&mut result, comment_id);
                count = count + 1;
            };
            i = i - 1;
        };
        result
    }

    // Get total post count
    public fun get_post_count(registry: &SuiSaysRegistry): u64 {
        registry.post_count
    }
}