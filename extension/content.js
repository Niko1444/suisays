class SuiBlinksExtension {
  constructor() {
    this.processedTweets = new Set();
    this.voteData = new Map();
    this.isWalletConnected = false;
    this.walletAddress = null;
    this.init();
  }

  async init() {
    console.log("🚀 Sui Blinks Extension Loaded");

    // Load cached vote data
    await this.loadCachedData();

    // Start monitoring for tweets
    this.startTweetMonitoring();

    // Load Sui integration
    await this.loadSuiIntegration();
  }

  async loadCachedData() {
    try {
      const cached = await chrome.storage.local.get([
        "voteData",
        "walletAddress",
      ]);
      if (cached.voteData) {
        this.voteData = new Map(Object.entries(cached.voteData));
      }
      if (cached.walletAddress) {
        this.walletAddress = cached.walletAddress;
        this.isWalletConnected = true;
      }
    } catch (error) {
      console.error("Error loading cached data:", error);
    }
  }

  async saveCachedData() {
    try {
      await chrome.storage.local.set({
        voteData: Object.fromEntries(this.voteData),
        walletAddress: this.walletAddress,
      });
    } catch (error) {
      console.error("Error saving cached data:", error);
    }
  }

  async loadSuiIntegration() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("sui-integration.js");
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  startTweetMonitoring() {
    // Initial scan
    this.scanForBlinks();

    // Monitor for new tweets (Twitter dynamically loads content)
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldScan = true;
        }
      });

      if (shouldScan) {
        setTimeout(() => this.scanForBlinks(), 500); // Debounce
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  scanForBlinks() {
    // Twitter/X tweet selectors (these might need updates based on UI changes)
    const tweetSelectors = [
      '[data-testid="tweet"]',
      'article[data-testid="tweet"]',
      '[data-testid="tweetText"]',
    ];

    let tweets = [];
    tweetSelectors.forEach((selector) => {
      tweets = tweets.concat([...document.querySelectorAll(selector)]);
    });

    tweets.forEach((tweet) => this.processTweet(tweet));
  }

  processTweet(tweetElement) {
    try {
      // Get tweet text content
      const textElement = tweetElement.querySelector(
        '[data-testid="tweetText"], [lang]'
      );
      if (!textElement) return;

      const tweetText = textElement.innerText || textElement.textContent || "";

      // Check if tweet contains Sui Blinks hashtag
      if (!this.isSuiBlink(tweetText)) return;

      // Generate unique tweet ID
      const tweetId = this.generateTweetId(tweetElement, tweetText);

      // Skip if already processed
      if (this.processedTweets.has(tweetId)) return;

      // Process the tweet
      this.addBlinkUI(tweetElement, tweetId, tweetText);
      this.processedTweets.add(tweetId);

      console.log(`📊 Processed SuiSays: ${tweetId}`);
    } catch (error) {
      console.error("Error processing tweet:", error);
    }
  }

  isSuiBlink(tweetText) {
    const blinkPatterns = [
      /#SuiBlink\b/i,
      /#SuiInsight\b/i,
      /#SuiPoll\b/i,
      /#SuiSays\b/i,
      /🔗.*sui/i,
    ];

    return blinkPatterns.some((pattern) => pattern.test(tweetText));
  }

  generateTweetId(tweetElement, tweetText) {
    // Try to get tweet URL first
    const tweetLink = tweetElement.querySelector('a[href*="/status/"]');
    if (tweetLink) {
      const match = tweetLink.href.match(/\/status\/(\d+)/);
      if (match) return `tweet_${match[1]}`;
    }

    // Fallback to content hash
    return `tweet_${this.hashCode(tweetText)}_${Date.now()}`;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  addBlinkUI(tweetElement, tweetId, tweetText) {
    // Check if UI already exists
    if (tweetElement.querySelector(".suisays-ui")) return;

    // Get current vote data
    const voteData = this.voteData.get(tweetId) || {
      agree: 0,
      disagree: 0,
      donations: 0,
      userVote: null,
    };

    // Create UI container
    const blinkUI = document.createElement("div");
    blinkUI.className = "suisays-ui";
    blinkUI.innerHTML = this.generateBlinkHTML(tweetId, voteData);

    // Add event listeners
    this.attachBlinkEventListeners(blinkUI, tweetId);

    // Insert UI into tweet - find the best position
    const insertPosition = this.findInsertPosition(tweetElement);
    if (insertPosition) {
      insertPosition.appendChild(blinkUI);
    } else {
      // Fallback: append to tweet
      tweetElement.appendChild(blinkUI);
    }
  }

  findInsertPosition(tweetElement) {
    // Try to find the tweet content area (before actions)
    const tweetText = tweetElement.querySelector('[data-testid="tweetText"]');
    if (tweetText) {
      // Insert after tweet text but before actions
      const parent = tweetText.closest('[data-testid="tweet"]');
      const actionsBar = parent.querySelector('[role="group"]');
      if (actionsBar) {
        // Create container before actions bar
        let container = actionsBar.parentElement;
        return container;
      }
    }

    // Fallback positions
    const alternatives = [
      tweetElement.querySelector('[data-testid="tweet"] > div:last-child'),
      tweetElement.querySelector('[data-testid="tweet"]'),
      tweetElement,
    ];

    return alternatives.find((el) => el) || tweetElement;
  }

  generateBlinkHTML(tweetId, voteData) {
    const walletSection = this.isWalletConnected
      ? `
        <div class="suisays-wallet-info">
          <span>🔌</span>
          <span class="suisays-wallet-address">${this.walletAddress?.slice(
            0,
            6
          )}...${this.walletAddress?.slice(-4)}</span>
        </div>
      `
      : `
        <button class="suisays-connect-btn" data-action="connect">Connect Wallet</button>
      `;

    return `
        <div class="suisays-container">
          <div class="suisays-header">
            <div class="suisays-logo">SuiSays Insight</div>
          </div>
          
          <div class="suisays-voting-section">
            <div class="suisays-vote-buttons">
              <button class="suisays-vote-btn agree ${
                voteData.userVote === "agree" ? "active" : ""
              }" 
                      data-action="vote" data-type="agree" data-tweet-id="${tweetId}">
                <span>👍</span>
                <span>Agree</span>
                <span>(${voteData.agree})</span>
              </button>
              <button class="suisays-vote-btn disagree ${
                voteData.userVote === "disagree" ? "active" : ""
              }" 
                      data-action="vote" data-type="disagree" data-tweet-id="${tweetId}">
                <span>👎</span>
                <span>Disagree</span>
                <span>(${voteData.disagree})</span>
              </button>
            </div>
            
            <div class="suisays-donation-section">
              <span style="font-size: 12px; font-weight: 600; color: #333333; white-space: nowrap;">Show conviction:</span>
              <input type="number" class="suisays-donation-input" placeholder="0.1" min="0.01" step="0.01" max="10">
              <button class="suisays-donate-btn" data-action="donate" data-tweet-id="${tweetId}">
                Donate SUI
              </button>
            </div>
            
            <div class="suisays-wallet-section">
              ${walletSection}
              <div class="suisays-total-donations">💰 ${
                voteData.donations
              } SUI donated</div>
            </div>
          </div>
          
          <div class="suisays-footer">
            <div class="suisays-stats">
              <div class="suisays-stat">
                <span>👥</span>
                <span>${voteData.agree + voteData.disagree} votes</span>
              </div>
            </div>
            <a href="https://suisays.com/post/${tweetId}" target="_blank" class="suisays-link">
              <span>View on SuiSays</span>
              <span>↗</span>
            </a>
          </div>
          
          <div class="suisays-status-message" id="status-${tweetId}"></div>
        </div>
      `;
  }

  attachBlinkEventListeners(blinkUI, tweetId) {
    // Vote buttons
    blinkUI.querySelectorAll('[data-action="vote"]').forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleVote(e, tweetId));
    });

    // Donate button
    const donateBtn = blinkUI.querySelector('[data-action="donate"]');
    if (donateBtn) {
      donateBtn.addEventListener("click", (e) =>
        this.handleDonation(e, tweetId)
      );
    }

    // Connect wallet button
    const connectBtn = blinkUI.querySelector('[data-action="connect"]');
    if (connectBtn) {
      connectBtn.addEventListener("click", () => this.connectWallet());
    }
  }

  async handleVote(event, tweetId) {
    if (!this.isWalletConnected) {
      this.showStatus(tweetId, "Please connect your wallet first", "error");
      return;
    }

    const voteType = event.target.dataset.type;
    const button = event.target;

    // Disable button during transaction
    button.disabled = true;
    this.showStatus(tweetId, `Submitting ${voteType} vote...`, "loading");

    try {
      // Call Sui blockchain function
      await window.suiIntegration.vote(tweetId, voteType, this.walletAddress);

      // Update local data
      const voteData = this.voteData.get(tweetId) || {
        agree: 0,
        disagree: 0,
        donations: 0,
        userVote: null,
      };

      // Remove previous vote
      if (voteData.userVote) {
        voteData[voteData.userVote]--;
      }

      // Add new vote
      voteData[voteType]++;
      voteData.userVote = voteType;

      this.voteData.set(tweetId, voteData);
      await this.saveCachedData();

      // Update UI
      this.updateBlinkUI(tweetId, voteData);
      this.showStatus(tweetId, `Vote submitted successfully!`, "success");
    } catch (error) {
      console.error("Vote error:", error);
      this.showStatus(tweetId, `Error: ${error.message}`, "error");
    } finally {
      button.disabled = false;
    }
  }

  async handleDonation(event, tweetId) {
    if (!this.isWalletConnected) {
      this.showStatus(tweetId, "Please connect your wallet first", "error");
      return;
    }

    const button = event.target;
    const input = button.parentElement.querySelector(".sui-donation-input");
    const amount = parseFloat(input.value);

    if (!amount || amount <= 0) {
      this.showStatus(tweetId, "Please enter valid donation amount", "error");
      return;
    }

    button.disabled = true;
    this.showStatus(tweetId, `Donating ${amount} SUI...`, "loading");

    try {
      await window.suiIntegration.donate(tweetId, amount, this.walletAddress);

      // Update local data
      const voteData = this.voteData.get(tweetId) || {
        agree: 0,
        disagree: 0,
        donations: 0,
        userVote: null,
      };
      voteData.donations += amount;
      this.voteData.set(tweetId, voteData);
      await this.saveCachedData();

      // Update UI
      this.updateBlinkUI(tweetId, voteData);
      this.showStatus(
        tweetId,
        `Donated ${amount} SUI successfully!`,
        "success"
      );
      input.value = "";
    } catch (error) {
      console.error("Donation error:", error);
      this.showStatus(tweetId, `Error: ${error.message}`, "error");
    } finally {
      button.disabled = false;
    }
  }

  async connectWallet() {
    try {
      this.showGlobalStatus("Connecting to Sui wallet...", "loading");

      const address = await window.suiIntegration.connectWallet();
      this.walletAddress = address;
      this.isWalletConnected = true;

      await this.saveCachedData();

      // Refresh all Blink UIs
      this.refreshAllBlinkUIs();

      this.showGlobalStatus("Wallet connected successfully!", "success");
    } catch (error) {
      console.error("Wallet connection error:", error);
      this.showGlobalStatus(`Connection failed: ${error.message}`, "error");
    }
  }

  updateBlinkUI(tweetId, voteData) {
    const blinkUI = document
      .querySelector(`[data-tweet-id="${tweetId}"]`)
      ?.closest(".suisays-ui");
    if (!blinkUI) return;

    // Update vote counts and active states
    const agreeBtn = blinkUI.querySelector('[data-type="agree"]');
    const disagreeBtn = blinkUI.querySelector('[data-type="disagree"]');
    const donationTotal = blinkUI.querySelector(".suisays-total-donations");

    if (agreeBtn) {
      agreeBtn.innerHTML = `<span>👍</span><span>Agree</span><span>(${voteData.agree})</span>`;
      agreeBtn.classList.toggle("active", voteData.userVote === "agree");
    }

    if (disagreeBtn) {
      disagreeBtn.innerHTML = `<span>👎</span><span>Disagree</span><span>(${voteData.disagree})</span>`;
      disagreeBtn.classList.toggle("active", voteData.userVote === "disagree");
    }

    if (donationTotal) {
      donationTotal.textContent = `💰 ${voteData.donations} SUI donated`;
    }

    // Update vote stats
    const voteStats = blinkUI.querySelector(".suisays-stat span:last-child");
    if (voteStats) {
      voteStats.textContent = `${voteData.agree + voteData.disagree} votes`;
    }
  }

  refreshAllBlinkUIs() {
    // Re-scan and update all Blink UIs after wallet connection
    this.processedTweets.clear();
    document.querySelectorAll(".suisays-ui").forEach((ui) => ui.remove());
    this.scanForBlinks();
  }

  showStatus(tweetId, message, type) {
    const statusEl = document.getElementById(`status-${tweetId}`);
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `suisays-status-message ${type}`;

      if (type === "success" || type === "error") {
        setTimeout(() => {
          statusEl.textContent = "";
          statusEl.className = "suisays-status-message";
        }, 3000);
      }
    }
  }

  showGlobalStatus(message, type) {
    // Create or update global status notification
    let notification = document.getElementById("sui-global-notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.id = "sui-global-notification";
      notification.className = "sui-global-notification";
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `sui-global-notification ${type} show`;

    if (type === "success" || type === "error") {
      setTimeout(() => {
        notification.classList.remove("show");
      }, 3000);
    }
  }
}

// Initialize the extension
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new SuiBlinksExtension();
  });
} else {
  new SuiBlinksExtension();
}
