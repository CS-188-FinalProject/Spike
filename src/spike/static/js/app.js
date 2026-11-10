
// ==========================================
// DRAKE MARKET - FRONT END JAVASCRIPT
// ==========================================

// Sample market data
const markets = [
    {
        id: "basketball",
        category: "Athletics",
        title: "Will Drake men's basketball win its next home game?",
        prob: 68,
        volume: "2.4K",
        closes: "Game day",
        detail: "Predict whether the Bulldogs will win their next home game."
    },
    {
        id: "dining",
        category: "Dining",
        title: "Will Hubbell dining hall serve breakfast-for-dinner this week?",
        prob: 42,
        volume: "1.1K",
        closes: "Friday",
        detail: "A campus dining prediction about whether breakfast-for-dinner will appear this week."
    },
    {
        id: "bulldog",
        category: "Campus",
        title: "Will the Bulldogs finish in the top three at the next campus event?",
        prob: 57,
        volume: "860",
        closes: "This month",
        detail: "A prediction about an upcoming Drake campus event."
    },
    {
        id: "soccer",
        category: "Athletics",
        title: "Will Drake soccer score 2 or more goals in its next match?",
        prob: 51,
        volume: "1.7K",
        closes: "Match day",
        detail: "Predict whether Drake soccer will score at least two goals."
    },
    {
        id: "coffee",
        category: "Campus",
        title: "Will the Olmsted coffee line be under 5 minutes at 9 AM?",
        prob: 35,
        volume: "540",
        closes: "Daily",
        detail: "A student-life prediction about a familiar campus morning."
    }
];

// ==========================================
// LOCAL DEMO STORAGE
// ==========================================

function readState() {
    try {
        return JSON.parse(localStorage.getItem("drakeMarketDemo")) || {
            balance: 1000,
            positions: [],
            comments: {}
        };
    } catch {
        return {
            balance: 1000,
            positions: [],
            comments: {}
        };
    }
}

function saveState(state) {
    localStorage.setItem("drakeMarketDemo", JSON.stringify(state));
}

function formatNumber(number) {
    return Number(number).toLocaleString("en-US");
}

// ==========================================
// MARKET CARD
// ==========================================

function marketCard(market) {
    return `
        <a class="market-card"
           href="market.html?id=${encodeURIComponent(market.id)}">

            <div class="market-top">
                <span class="category">${market.category}</span>
                <span class="market-meta">
                    ${market.volume} credits traded
                </span>
            </div>

            <h3>${market.title}</h3>

            <div class="market-bottom">
                <span class="market-meta">
                    Closes: ${market.closes}
                </span>

                <span class="probability">
                    ${market.prob}%
                    <span class="small">YES</span>
                </span>
            </div>

        </a>
    `;
}

// ==========================================
// HOME PAGE
// ==========================================

const homeMarkets = document.querySelector("#home-markets");

if (homeMarkets) {
    homeMarkets.innerHTML = markets
        .slice(0, 3)
        .map(marketCard)
        .join("");
}

// ==========================================
// MARKETS PAGE
// ==========================================

const allMarkets = document.querySelector("#all-markets");

if (allMarkets) {

    let currentFilter = "All";

    const searchInput = document.querySelector("#market-search");
    const marketCount = document.querySelector("#market-count");

    function renderMarkets() {

        const search = searchInput.value.toLowerCase();

        const filteredMarkets = markets.filter(market => {

            const matchesCategory =
                currentFilter === "All" ||
                market.category === currentFilter;

            const matchesSearch =
                (market.title + " " + market.category)
                .toLowerCase()
                .includes(search);

            return matchesCategory && matchesSearch;
        });

        if (filteredMarkets.length > 0) {
            allMarkets.innerHTML = filteredMarkets
                .map(marketCard)
                .join("");
        } else {
            allMarkets.innerHTML = `
                <div class="empty-state">
                    No markets match your search.
                    Try another keyword or category.
                </div>
            `;
        }

        marketCount.textContent =
            `${filteredMarkets.length} markets`;
    }

    // Search functionality
    searchInput.addEventListener("input", renderMarkets);

    // Category filters
    document.querySelectorAll("[data-filter]").forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll("[data-filter]")
                .forEach(item => item.classList.remove("selected"));

            button.classList.add("selected");

            currentFilter = button.dataset.filter;

            renderMarkets();
        });

    });

    renderMarkets();
}

// ==========================================
// MARKET DETAILS PAGE
// ==========================================

const marketDetail = document.querySelector("#market-detail");

if (marketDetail) {

    const params = new URLSearchParams(window.location.search);

    const marketId = params.get("id") || "basketball";

    const market = markets.find(item => item.id === marketId)
        || markets[0];

    marketDetail.innerHTML = `

        <article class="detail-card">

            <span class="category">${market.category}</span>

            <h1>${market.title}</h1>

            <p class="muted">${market.detail}</p>

            <div class="detail-prob">
                ${market.prob}%
            </div>

            <div class="muted small">
                Community YES estimate · Sample data
            </div>

            <div class="detail-actions">

                <button class="button button-yes"
                        data-trade="YES">
                    Buy YES
                </button>

                <button class="button button-no"
                        data-trade="NO">
                    Buy NO
                </button>

            </div>

            <p class="detail-info">
                Closes: ${market.closes}<br>
                ${market.volume} demo credits traded<br>
                Probabilities and volume are illustrative sample data.
            </p>

        </article>

        <section class="comment-box">

            <h2>Campus conversation</h2>

            <form class="comment-form" id="comment-form">

                <label class="sr-only" for="comment-input">
                    Add a comment
                </label>

                <input
                    id="comment-input"
                    maxlength="180"
                    placeholder="Share your take..."
                    required
                >

                <button class="button button-primary" type="submit">
                    Post
                </button>

            </form>

            <div id="comments"></div>

        </section>
    `;

    // ======================================
    // SIMULATED TRADING
    // ======================================

    const tradeDialog = document.querySelector("#trade-dialog");

    let selectedSide = "YES";

    document.querySelectorAll("[data-trade]").forEach(button => {

        button.addEventListener("click", () => {

            selectedSide = button.dataset.trade;

            document.querySelector("#trade-title").textContent =
                `Buy ${selectedSide} shares`;

            document.querySelector("#trade-description").textContent =
                `Simulated ${selectedSide} position: ${market.title}`;

            tradeDialog.showModal();

        });

    });

    document.querySelector("#trade-form")
        .addEventListener("submit", event => {

            event.preventDefault();

            const amount = Number(
                document.querySelector("#trade-amount").value
            );

            const state = readState();

            if (
                !Number.isInteger(amount) ||
                amount < 1 ||
                amount > state.balance
            ) {
                alert("Enter a valid amount within your available credits.");
                return;
            }

            state.balance -= amount;

            const existingPosition = state.positions.find(position =>
                position.id === market.id &&
                position.side === selectedSide
            );

            if (existingPosition) {

                existingPosition.amount += amount;

            } else {

                state.positions.push({
                    id: market.id,
                    title: market.title,
                    side: selectedSide,
                    amount: amount
                });

            }

            saveState(state);

            tradeDialog.close();

            alert(
                `Practice trade saved: ${selectedSide} · ${amount} credits`
            );

        });

    // ======================================
    // COMMENTS
    // ======================================

    const commentsContainer = document.querySelector("#comments");

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function renderComments() {

        const state = readState();

        const comments = state.comments[market.id] || [];

        if (comments.length === 0) {

            commentsContainer.innerHTML = `
                <p class="muted small">
                    No comments yet. Start the conversation.
                </p>
            `;

            return;
        }

        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment">
                <b>${escapeHTML(comment.name)}</b>
                <p>${escapeHTML(comment.text)}</p>
            </div>
        `).join("");
    }

    document.querySelector("#comment-form")
        .addEventListener("submit", event => {

            event.preventDefault();

            const input = document.querySelector("#comment-input");

            const text = input.value.trim();

            if (!text) return;

            const state = readState();

            if (!state.comments[market.id]) {
                state.comments[market.id] = [];
            }

            state.comments[market.id].unshift({
                name: "Colton",
                text: text
            });

            saveState(state);

            input.value = "";

            renderComments();

        });

    renderComments();
}

// ==========================================
// PORTFOLIO PAGE
// ==========================================

const positionsContainer = document.querySelector("#positions");

if (positionsContainer) {

    const state = readState();

    document.querySelector("#portfolio-balance").textContent =
        formatNumber(state.balance);

    document.querySelector("#position-count").textContent =
        state.positions.length;

    if (state.positions.length > 0) {

        positionsContainer.innerHTML = state.positions.map(position => `

            <article class="market-card">

                <div class="market-top">

                    <span class="category">
                        ${position.side} position
                    </span>

                    <span class="market-meta">
                        ${formatNumber(position.amount)} credits
                    </span>

                </div>

                <h3>${position.title}</h3>

                <div class="market-bottom">
                    <span class="market-meta">
                        Practice position
                    </span>

                    <b>${position.side}</b>
                </div>

            </article>

        `).join("");

    } else {

        positionsContainer.innerHTML = `
            <div class="empty-state">
                You do not have any positions yet.
                <br><br>
                <a class="text-link" href="markets.html">
                    Explore markets →
                </a>
            </div>
        `;

    }
}

// Log Out
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        const confirmLogout = confirm("Are you sure you want to log out?");

        if (confirmLogout) {
            localStorage.removeItem("drakeMarketUser");
            window.location.href = "index.html";
        }
    });
}


// Delete Account
const deleteAccountButton = document.getElementById("deleteAccountButton");

if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", function () {
        const confirmDelete = confirm(
            "Are you sure you want to delete your account? This cannot be undone."
        );

        if (confirmDelete) {
            localStorage.clear();
            alert("Your demo account data has been deleted.");
            window.location.href = "index.html";
        }
    });
}