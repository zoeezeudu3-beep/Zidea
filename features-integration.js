// ============================================================================
// INTEGRATION HELPERS - Connect features to Zidea UI
// ============================================================================

/**
 * Initialize all features on page load
 */
function initializeFeatures() {
  console.log('Initializing Zidea features...');
  
  // Initialize friend system
  window.friendSystem = new FriendSystem();
  
  // Initialize chess game
  window.chessGame = new EnhancedChessGame();
  
  // Update game emojis in arcade
  updateArcadeGameEmojis();
  
  // Load pending friend requests for current user
  loadPendingFriendRequests();
  
  console.log('✅ Features initialized');
}

// ============================================================================
// FRIEND SYSTEM UI INTEGRATION
// ============================================================================

/**
 * Show friend request UI
 */
function showFriendRequestPanel() {
  const panel = document.createElement('div');
  panel.className = 'card';
  panel.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
  
  panel.innerHTML = `
    <div style="font-size:15px;font-weight:800;color:#fff">Add Friend</div>
    <div class="input-wrap">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input 
        type="text" 
        class="input-field" 
        id="friend-search-input" 
        placeholder="Search @username" 
        style="width:100%"
      />
    </div>
    <button class="btn-primary" onclick="sendFriendRequestUI()" style="width:100%">Send Request</button>
    <div id="friend-status" style="color:#9CA3AF;font-size:13px;line-height:1.6;display:none"></div>
  `;
  
  return panel;
}

/**
 * Send friend request from UI
 */
async function sendFriendRequestUI() {
  const input = document.getElementById('friend-search-input');
  const statusDiv = document.getElementById('friend-status');
  const username = input?.value.trim();
  
  if (!username) {
    if (statusDiv) {
      statusDiv.textContent = '❌ Please enter a username';
      statusDiv.style.display = 'block';
      statusDiv.style.color = '#F87171';
    }
    return;
  }
  
  const currentUserId = getCurrentUserId();
  const result = await window.friendSystem.sendFriendRequest(currentUserId, username);
  
  if (statusDiv) {
    statusDiv.style.display = 'block';
    if (result.success) {
      statusDiv.textContent = `✅ ${result.message}`;
      statusDiv.style.color = '#22D3A0';
      if (input) input.value = '';
    } else {
      statusDiv.textContent = `❌ ${result.error}`;
      statusDiv.style.color = '#F87171';
    }
  }
}

/**
 * Load and display pending friend requests
 */
async function loadPendingFriendRequests() {
  const userId = getCurrentUserId();
  if (!userId) return;
  
  const requests = await window.friendSystem.getPendingRequests(userId);
  if (requests.length === 0) return;
  
  const container = document.createElement('div');
  container.className = 'card';
  container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
  
  let html = `<div style="font-size:15px;font-weight:800;color:#fff">Friend Requests (${requests.length})</div>`;
  
  for (const req of requests) {
    html += `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px;background:rgba(124,58,237,.1);border-radius:12px;">
        <span style="color:#fff;font-size:13px;">@${req.fromUsername}</span>
        <div style="display:flex;gap:8px;">
          <button class="btn-primary" style="padding:6px 12px;font-size:12px" onclick="acceptFriendRequestUI('${req.id}')">Accept</button>
          <button class="btn-ghost" style="padding:6px 12px;font-size:12px" onclick="declineFriendRequestUI('${req.id}')">Decline</button>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  
  // Insert into dashboard if available
  const dashboard = document.getElementById('user-list');
  if (dashboard) {
    dashboard.parentElement.insertBefore(container, dashboard);
  }
}

/**
 * Accept friend request from UI
 */
async function acceptFriendRequestUI(requestId) {
  const userId = getCurrentUserId();
  const result = await window.friendSystem.acceptFriendRequest(requestId, userId);
  
  if (result.success) {
    showToast('✅ ' + result.message, 'success');
    loadPendingFriendRequests();
  } else {
    showToast('❌ ' + result.error, 'error');
  }
}

/**
 * Decline friend request from UI
 */
async function declineFriendRequestUI(requestId) {
  const userId = getCurrentUserId();
  const result = await window.friendSystem.declineFriendRequest(requestId, userId);
  
  if (result.success) {
    showToast('✅ Request declined', 'success');
    loadPendingFriendRequests();
  } else {
    showToast('❌ ' + result.error, 'error');
  }
}

// ============================================================================
// CHESS UI INTEGRATION
// ============================================================================

/**
 * Initialize chess game UI
 */
function initializeChessUI() {
  const chessBoard = document.getElementById('chess-board');
  if (!chessBoard) return;
  
  // Render initial board
  renderChessBoard();
  
  // Add undo button
  const undoBtn = document.createElement('button');
  undoBtn.className = 'btn-ghost';
  undoBtn.textContent = '↶ Undo Move';
  undoBtn.style.cssText = 'margin-top:12px;width:100%;';
  undoBtn.onclick = () => undoChessMoveUI();
  
  chessBoard.parentElement.appendChild(undoBtn);
  
  // Add no time control indicator
  const timeControlLabel = document.getElementById('chess-clock-label');
  if (timeControlLabel) {
    timeControlLabel.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;color:#22d3a0;">
        <span style="width:8px;height:8px;border-radius:50%;background:#22d3a0;"></span>
        No Time Control
      </div>
    `;
  }
}

/**
 * Render chess board visually
 */
function renderChessBoard() {
  const board = window.chessGame.board;
  const boardEl = document.getElementById('chess-board');
  if (!boardEl) return;
  
  boardEl.innerHTML = '';
  
  const pieces = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
  };
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      const isLight = (row + col) % 2 === 0;
      
      const btn = document.createElement('button');
      btn.style.cssText = `
        background: ${isLight ? '#e2d5b8' : '#a89968'};
        border: none;
        color: ${piece && piece === piece.toUpperCase() ? '#fff' : '#000'};
        font-size: 28px;
        font-weight: 700;
        cursor: pointer;
        padding: 0;
      `;
      btn.textContent = piece ? pieces[piece] : '';
      btn.onclick = () => handleChessSquareClick(row, col);
      
      boardEl.appendChild(btn);
    }
  }
  
  // Update score display
  const scoreData = window.chessGame.getScoreDisplay();
  displayChessScores(document.getElementById('chess-status') || boardEl.parentElement, scoreData);
}

/**
 * Handle chess square click
 */
let selectedSquare = null;

function handleChessSquareClick(row, col) {
  if (!selectedSquare) {
    const piece = window.chessGame.board[row][col];
    if (piece) {
      selectedSquare = { row, col };
      // Highlight selected square
      updateChessBoardHighlight(row, col);
    }
  } else {
    // Try to make move
    const result = window.chessGame.makeMove(selectedSquare.row, selectedSquare.col, row, col);
    
    if (result.success) {
      showToast('✅ Move made', 'success');
      
      // Update board visually
      renderChessBoard();
      
      // Show captured piece feedback
      if (result.capturedPiece) {
        showToast(`🎯 Captured! ${result.scoreUpdate.white > 0 ? '+' + result.scoreUpdate.white : result.scoreUpdate.black}`, 'info');
      }
      
      // AI makes move after delay
      setTimeout(async () => {
        const aiResult = await window.chessGame.getAIMove();
        if (aiResult.success) {
          renderChessBoard();
        } else {
          showToast('Game Over: ' + aiResult.error, 'info');
        }
      }, 1500);
    } else {
      showToast('❌ Invalid move', 'error');
    }
    
    selectedSquare = null;
  }
}

/**
 * Highlight selected chess square
 */
function updateChessBoardHighlight(row, col) {
  const buttons = document.querySelectorAll('#chess-board button');
  buttons.forEach((btn, idx) => {
    const btnRow = Math.floor(idx / 8);
    const btnCol = idx % 8;
    if (btnRow === row && btnCol === col) {
      btn.style.boxShadow = '0 0 0 3px rgba(34, 211, 160, 0.6) inset';
    }
  });
}

/**
 * Undo last chess move
 */
function undoChessMoveUI() {
  const result = window.chessGame.undoLastMove();
  
  if (result.success) {
    showToast('✅ Move undone', 'success');
    renderChessBoard();
  } else {
    showToast('❌ ' + result.error, 'error');
  }
}

// ============================================================================
// ARCADE GAME EMOJI UPDATES
// ============================================================================

/**
 * Update all game emojis in arcade
 */
function updateArcadeGameEmojis() {
  const gameCards = document.querySelectorAll('.arcade-card, .game-item');
  
  gameCards.forEach(card => {
    let title = '';
    
    // Get game name from title
    const titleEl = card.querySelector('.arcade-card-title') || card.querySelector('.game-info strong');
    if (titleEl) {
      title = titleEl.textContent.trim();
    }
    
    if (!title) return;
    
    const emoji = window.getGameEmoji(title);
    
    // Update emoji in icon
    const iconEl = card.querySelector('.arcade-icon, .game-emoji');
    if (iconEl) {
      iconEl.textContent = emoji;
    }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current user ID from session
 */
function getCurrentUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('zidea_session') || '{}');
    return session.userId || session.id || null;
  } catch {
    return null;
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toastWrap = document.querySelector('.toast-wrap') || (() => {
    const wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
    return wrap;
  })();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    color: ${type === 'error' ? '#F87171' : type === 'success' ? '#22D3A0' : '#E5E7EB'};
    border-color: ${type === 'error' ? 'rgba(248,113,113,.4)' : type === 'success' ? 'rgba(34,211,160,.4)' : 'rgba(124,58,237,.4)'};
  `;
  
  toastWrap.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  try {
    const user = await db.read(`users/${userId}`);
    return user;
  } catch {
    return null;
  }
}

/**
 * Get all friends for user
 */
async function getUserFriends(userId) {
  try {
    return await window.friendSystem.getFriends(userId);
  } catch {
    return [];
  }
}

// ============================================================================
// AUTO-INIT ON PAGE LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeFeatures();
  initializeChessUI();
  updateArcadeGameEmojis();
});

// Also run on window load
window.addEventListener('load', () => {
  updateArcadeGameEmojis();
});
