# SuiSays - An Opinion Platform on Sui

![SuiSays Logo](suisays-site/packages/frontend/public/banner.png)

**SuiSays** is a decentralized social platform built on the Sui blockchain that enables users to share opinions, vote on posts, donate to show conviction, and engage in meaningful discussions with transparent, immutable interactions.

## 🌟 Overview

SuiSays transforms social media discourse by leveraging blockchain technology to create a transparent, decentralized platform where:

- **Posts are immutable** - Once created, content is permanently stored on-chain
- **Voting is transparent** - All votes are recorded on the blockchain
- **Donations show conviction** - Users can donate SUI tokens to posts they strongly support
- **Comments are categorized** - Users specify if they agree or disagree when commenting
- **Everything is verifiable** - All interactions can be independently verified on the blockchain

## 🏗️ Architecture

The project consists of three main components:

### 1. **Smart Contract** (`suisays-site/packages/backend/`)

- **Language**: Move (Sui's smart contract language)
- **Location**: `move/suisays/sources/suisays.move`
- **Features**:
  - Post creation and management
  - Voting system (agree/disagree)
  - Donation handling with SUI tokens
  - Comment system with voting alignment
  - Post ranking algorithms (recent, most voted)

### 2. **Web Application** (`suisays-site/packages/frontend/`)

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain Integration**: Sui dApp Kit
- **Features**:
  - Wallet connection (Sui Wallet, Suiet)
  - Post creation and browsing
  - Voting interface
  - Donation system
  - Comment threads
  - Real-time updates

### 3. **Browser Extension** (`extension/`)

- **Type**: Chrome/Firefox extension
- **Purpose**: Integrates SuiSays voting directly into Twitter/X
- **Features**:
  - Adds voting widgets to tweets
  - Shows aggregate opinion data
  - Enables donations on tweet content
  - Wallet integration for seamless interactions

## 🚀 Key Features

### 📝 **Decentralized Posts**

- Create immutable posts stored on Sui blockchain
- Content cannot be censored or deleted
- Permanent record of all discussions

### 🗳️ **Transparent Voting**

- Vote "Agree" or "Disagree" on any post
- All votes recorded on-chain
- Users can change their votes
- Real-time vote counting

### 💰 **Conviction Through Donations**

- Donate SUI tokens to posts you strongly support
- Donations are permanently recorded
- Shows community conviction beyond simple voting
- Donated funds are locked to the post

### 💬 **Aligned Comments**

- Comment on posts while specifying your stance (agree/disagree)
- Comments are categorized by alignment
- Users can "back" comments they support
- Threaded discussion system

### 🏆 **Post Rankings**

- **Trending**: Most recent posts
- **Most Voted**: Posts with highest engagement
- **Top Donated**: Posts with most financial support

### 🌐 **Cross-Platform Integration**

- Native web application for full functionality
- Browser extension for Twitter/X integration
- Seamless wallet connection across platforms

## 🛠️ Technology Stack

### Blockchain

- **Sui Network**: Layer-1 blockchain for fast, low-cost transactions
- **Move Language**: Smart contract development
- **Sui dApp Kit**: Frontend blockchain integration

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component library
- **React Query**: State management and caching

### Development Tools

- **pnpm**: Efficient package management
- **Suibase**: Local Sui network development
- **Firebase**: Deployment platform
- **ESLint/Prettier**: Code quality tools

## 📦 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (≥ 20)
- [pnpm](https://pnpm.io/) (≥ 9)
- [Suibase](https://suibase.io/how-to/install.html)
- [Sui Wallet](https://sui.io/wallet) or [Suiet Wallet](https://suiet.app/)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/Niko1444/suisays.git
   cd suisays/suisays-site
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start local Sui network**

   ```bash
   pnpm localnet:start
   ```

4. **Deploy smart contract**

   ```bash
   pnpm localnet:deploy
   ```

5. **Start the frontend**

   ```bash
   pnpm start
   ```

6. **Access the application**
   - Web app: http://localhost:3000
   - Local Sui Explorer: http://localhost:9001

### Browser Extension Setup

1. **Navigate to extension directory**

   ```bash
   cd ../extension
   ```

2. **Load extension in Chrome**

   - Open Chrome → Settings → Extensions
   - Enable "Developer mode"
   - Click "Load unpacked" → Select the `extension` folder

3. **Visit Twitter/X** to see SuiSays voting widgets

## 🎯 Usage

### Web Application

1. **Connect Wallet**

   - Click "Connect Wallet" in the header
   - Select your preferred wallet (Sui Wallet or Suiet)
   - Approve the connection

2. **Create Posts**

   - Click the "+" button or use the create post card
   - Enter your opinion or statement
   - Submit to blockchain (requires gas fee)

3. **Vote on Posts**

   - Click "👍 Agree" or "👎 Disagree" on any post
   - Transactions are recorded on-chain
   - You can change your vote at any time

4. **Donate to Posts**

   - Click the donate button on posts you strongly support
   - Enter amount in SUI tokens
   - Confirm transaction in wallet

5. **Add Comments**
   - Click comment button on posts
   - Specify if you agree or disagree with the post
   - Your comment alignment is recorded

### Browser Extension

1. **Browse Twitter/X** normally
2. **See SuiSays widgets** appear on tweets automatically
3. **Vote directly** on tweet content using the embedded interface
4. **Donate SUI** to tweets that resonate with you
5. **View aggregate data** from the community

## 🔧 Smart Contract Details

### Core Functions

#### `create_post(content: String)`

Creates a new post with the given content

#### `vote(post_id: String, vote_type: u8)`

Vote on a post (1 = agree, 2 = disagree)

#### `donate(post_id: String, donation: vector<Coin<SUI>>)`

Donate SUI tokens to a post

#### `add_comment(post_id: String, content: String, vote_side: u8)`

Add a comment with stance alignment

#### `back_comment(post_id: String, comment_id: String)`

Support a comment by "backing" it

### Data Structures

```move
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
```

## 🚀 Deployment

### Frontend Deployment Options

#### Firebase Hosting

```bash
pnpm deploy:firebase:init
pnpm deploy:firebase
```

#### Walrus Sites (Decentralized)

```bash
pnpm deploy:walrus:testnet
# or
pnpm deploy:walrus:mainnet
```

#### Arweave (Permanent Storage)

```bash
pnpm deploy:arweave
```

### Smart Contract Deployment

#### Testnet

```bash
pnpm testnet:deploy
```

#### Mainnet

```bash
pnpm mainnet:deploy
```

## 🧪 Testing

Run the smart contract tests:

```bash
pnpm test
```

The test suite covers:

- Post creation and retrieval
- Voting mechanics
- Donation functionality
- Comment system
- Edge cases and error conditions

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make changes** and test thoroughly
4. **Commit changes** (`git commit -m 'Add amazing feature'`)
5. **Push to branch** (`git push origin feature/amazing-feature`)
6. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new functionality
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Update documentation as needed

## 📋 Available Commands

| Command                          | Description              |
| -------------------------------- | ------------------------ |
| `pnpm start`                     | Start development server |
| `pnpm build`                     | Build for production     |
| `pnpm test`                      | Run smart contract tests |
| `pnpm localnet:start`            | Start local Sui network  |
| `pnpm localnet:deploy`           | Deploy to local network  |
| `pnpm localnet:faucet <address>` | Fund address on localnet |
| `pnpm testnet:deploy`            | Deploy to testnet        |
| `pnpm mainnet:deploy`            | Deploy to mainnet        |
| `pnpm lint`                      | Run code linting         |
| `pnpm format`                    | Format code              |

## 🔗 Useful Links

- **[Sui Documentation](https://docs.sui.io/)**
- **[Move Book](https://move-book.com/)**
- **[Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)**
- **[Suibase Documentation](https://suibase.io/)**
- **[Local Sui Explorer](http://localhost:9001)** (when running locally)

## 🐛 Known Issues & Limitations

- Browser extension currently supports Chrome/Firefox only
- Local development requires Suibase setup
- Gas fees required for all on-chain interactions
- Comments are currently single-level (no nested replies)

## 🗺️ Roadmap

### Short Term

- [ ] Nested comment replies
- [ ] User profiles and reputation system
- [ ] Post categories and tags
- [ ] Mobile-responsive improvements

### Medium Term

- [ ] Cross-chain bridge integration
- [ ] NFT integration for special posts
- [ ] Advanced voting mechanisms (quadratic voting)
- [ ] Content moderation tools

### Long Term

- [ ] Mobile applications (iOS/Android)
- [ ] Integration with other social platforms
- [ ] Governance token for platform decisions
- [ ] Advanced analytics dashboard

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Comprehensive guides and API reference

---

**Built with ❤️ on Sui blockchain**

_SuiSays - the platform where your INSIGHTS -> VALUE_
