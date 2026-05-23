// ============================================================================
// ZIDEA FEATURES IMPLEMENTATION
// ============================================================================
// This file contains implementations for:
// 1. Friend System with friend requests
// 2. Enhanced Chess Features (no time control, move takeback, AI timing)
// 3. Game Emojis Configuration

// ============================================================================
// 1. FRIEND SYSTEM - Friend Request Management
// ============================================================================

class FriendSystem {
  constructor() {
    this.friendRequests = new Map(); // Map of {userId: {from, timestamp, status}}
    this.friends = new Set();
    this.blockedUsers = new Set();
  }

  /**
   * Send a friend request to a user by username
   * @param {string} fromUserId - The user sending the request
   * @param {string} toUsername - The username of the person to request
   * @returns {Promise<Object>} Request result
   */
  async sendFriendRequest(fromUserId, toUsername) {
    try {
      // Search for user by username
      const toUser = await this.findUserByUsername(toUsername);
      
      if (!toUser) {
        return { success: false, error: 'User not found' };
      }

      if (toUser.id === fromUserId) {
        return { success: false, error: 'Cannot add yourself as friend' };
      }

      if (this.friends.has(toUser.id)) {
        return { success: false, error: 'Already friends with this user' };
      }

      if (this.blockedUsers.has(toUser.id)) {
        return { success: false, error: 'User is blocked' };
      }

      // Check if request already exists
      if (this.friendRequests.has(toUser.id)) {
        return { success: false, error: 'Friend request already sent' };
      }

      // Save friend request to Firebase
      const requestId = `friend_req_${fromUserId}_${toUser.id}_${Date.now()}`;
      await db.write(`friend_requests/${toUser.id}/${requestId}`, {
        from: fromUserId,
        timestamp: Date.now(),
        status: 'pending',
        fromUsername: await this.getUserUsername(fromUserId)
      });

      this.friendRequests.set(toUser.id, {
        from: fromUserId,
        timestamp: Date.now(),
        status: 'pending'
      });

      return { 
        success: true, 
        message: `Friend request sent to @${toUsername}`,
        requestId 
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Accept a friend request
   * @param {string} requestId - The friend request ID
   * @param {string} userId - The user accepting the request
   */
  async acceptFriendRequest(requestId, userId) {
    try {
      const request = await db.read(`friend_requests/${userId}/${requestId}`);
      
      if (!request) {
        return { success: false, error: 'Request not found' };
      }

      const fromUserId = request.from;

      // Add both users as friends
      await db.write(`users/${userId}/friends/${fromUserId}`, { 
        status: 'accepted',
        timestamp: Date.now() 
      });
      
      await db.write(`users/${fromUserId}/friends/${userId}`, { 
        status: 'accepted',
        timestamp: Date.now() 
      });

      // Mark request as accepted
      await db.patch(`friend_requests/${userId}/${requestId}`, { 
        status: 'accepted' 
      });

      this.friends.add(fromUserId);

      return { success: true, message: 'Friend request accepted' };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Decline a friend request
   * @param {string} requestId - The friend request ID
   * @param {string} userId - The user declining the request
   */
  async declineFriendRequest(requestId, userId) {
    try {
      await db.patch(`friend_requests/${userId}/${requestId}`, { 
        status: 'declined' 
      });

      this.friendRequests.delete(userId);
      return { success: true, message: 'Friend request declined' };
    } catch (error) {
      console.error('Error declining friend request:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all pending friend requests for a user
   * @param {string} userId - The user ID
   */
  async getPendingRequests(userId) {
    try {
      const requests = await db.read(`friend_requests/${userId}`);
      if (!requests) return [];

      return Object.entries(requests)
        .filter(([_, req]) => req.status === 'pending')
        .map(([id, req]) => ({ id, ...req }));
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }
  }

  /**
   * Find user by username
   * @param {string} username - The username to search for
   */
  async findUserByUsername(username) {
    try {
      const users = await db.read('users');
      if (!users) return null;

      for (const [userId, user] of Object.entries(users)) {
        if (user.username === username) {
          return { id: userId, ...user };
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  /**
   * Get username from user ID
   * @param {string} userId - The user ID
   */
  async getUserUsername(userId) {
    try {
      const user = await db.read(`users/${userId}`);
      return user?.username || 'unknown';
    } catch (error) {
      console.error('Error fetching username:', error);
      return 'unknown';
    }
  }

  /**
   * Get list of friends
   * @param {string} userId - The user ID
   */
  async getFriends(userId) {
    try {
      const friends = await db.read(`users/${userId}/friends`);
      if (!friends) return [];

      return Promise.all(
        Object.keys(friends).map(friendId => this.getUserUsername(friendId))
      );
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }
}

// ============================================================================
// 2. CHESS ENGINE ENHANCEMENTS
// ============================================================================

class EnhancedChessGame {
  constructor() {
    this.moveHistory = [];
    this.board = this.initBoard();
    this.currentPlayer = 'white';
    this.capturedPieces = { white: [], black: [] };
    this.scoreTracking = { white: 0, black: 0 };
    this.noTimeControl = true; // No time limit
    this.aiThinkingTime = 1500; // 1.5 seconds
    this.lastMoveCanBeUndone = true;
  }

  initBoard() {
    // Standard chess starting position
    return [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
  }

  /**
   * Make a move on the board
   * @param {number} fromRow - Starting row
   * @param {number} fromCol - Starting column
   * @param {number} toRow - Ending row
   * @param {number} toCol - Ending column
   * @returns {Object} Move result
   */
  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    
    if (!piece) {
      return { success: false, error: 'No piece at starting position' };
    }

    const targetPiece = this.board[toRow][toCol];
    
    // Check if piece belongs to current player
    const isWhitePiece = piece === piece.toUpperCase();
    const isWhiteTurn = this.currentPlayer === 'white';
    
    if (isWhitePiece !== isWhiteTurn) {
      return { success: false, error: 'Not your turn' };
    }

    // Record move history before making the move
    this.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: piece,
      captured: targetPiece,
      timestamp: Date.now()
    });

    // Track captured pieces for score
    if (targetPiece) {
      const capturedColor = targetPiece === targetPiece.toUpperCase() ? 'white' : 'black';
      this.capturedPieces[capturedColor].push(targetPiece);
      
      // Update score (standard piece values)
      const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
      const value = pieceValues[targetPiece.toLowerCase()] || 0;
      const opponent = isWhiteTurn ? 'black' : 'white';
      
      this.scoreTracking[opponent] += value;
    }

    // Make the move
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Switch turn
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    return { 
      success: true, 
      message: 'Move made successfully',
      scoreUpdate: this.scoreTracking,
      capturedPiece: targetPiece
    };
  }

  /**
   * Undo the last move
   * @returns {Object} Undo result
   */
  undoLastMove() {
    if (this.moveHistory.length === 0) {
      return { success: false, error: 'No moves to undo' };
    }

    const lastMove = this.moveHistory.pop();
    
    // Restore piece to original position
    this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;

    // Restore captured piece if any
    if (lastMove.captured) {
      const capturedColor = lastMove.captured === lastMove.captured.toUpperCase() ? 'white' : 'black';
      const lastCaptured = this.capturedPieces[capturedColor].pop();
      
      // Restore score
      const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
      const value = pieceValues[lastMove.captured.toLowerCase()] || 0;
      const opponent = this.currentPlayer === 'white' ? 'black' : 'white';
      
      this.scoreTracking[opponent] -= value;
    }

    // Switch turn back
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

    return { 
      success: true, 
      message: 'Move undone',
      scoreUpdate: this.scoreTracking
    };
  }

  /**
   * Get AI move after thinking time
   * @returns {Promise<Object>} AI move
   */
  async getAIMove() {
    // Simulate AI thinking time (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, this.aiThinkingTime));

    // Simple AI: find all valid moves and pick a reasonable one
    const validMoves = this.getAllValidMoves('black');
    
    if (validMoves.length === 0) {
      return { success: false, error: 'Checkmate or Stalemate' };
    }

    // Prefer capturing moves
    const capturingMoves = validMoves.filter(move => 
      this.board[move.to.row][move.to.col] !== null
    );

    const chosenMove = capturingMoves.length > 0 
      ? capturingMoves[Math.floor(Math.random() * capturingMoves.length)]
      : validMoves[Math.floor(Math.random() * validMoves.length)];

    return this.makeMove(
      chosenMove.from.row,
      chosenMove.from.col,
      chosenMove.to.row,
      chosenMove.to.col
    );
  }

  /**
   * Get all valid moves for a player
   * @param {string} player - 'white' or 'black'
   * @returns {Array} Array of valid moves
   */
  getAllValidMoves(player) {
    const moves = [];
    const isWhite = player === 'white';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        
        if (!piece) continue;
        
        const isWhitePiece = piece === piece.toUpperCase();
        if (isWhitePiece !== isWhite) continue;

        const pieceMoves = this.getValidMovesForPiece(row, col, piece);
        moves.push(...pieceMoves);
      }
    }

    return moves;
  }

  /**
   * Get valid moves for a specific piece
   * @param {number} row - Piece row
   * @param {number} col - Piece column
   * @param {string} piece - The piece character
   * @returns {Array} Valid moves for this piece
   */
  getValidMovesForPiece(row, col, piece) {
    const moves = [];
    const pieceLower = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    // Simple move generation (can be enhanced with full chess rules)
    const directions = {
      'p': isWhite ? [[-1, -1], [-1, 0], [-1, 1]] : [[1, -1], [1, 0], [1, 1]],
      'n': [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
      'b': [[-1, -1], [-1, 1], [1, -1], [1, 1]],
      'r': [[-1, 0], [1, 0], [0, -1], [0, 1]],
      'q': [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
      'k': [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    };

    const dirs = directions[pieceLower] || [];
    for (const [dr, dc] of dirs) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const target = this.board[newRow][newCol];
        const isWhiteTarget = target && target === target.toUpperCase();
        
        if (!target || isWhiteTarget !== isWhite) {
          moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
        }
      }
    }

    return moves;
  }

  /**
   * Get score display for both players
   * @returns {Object} Score data with display strings
   */
  getScoreDisplay() {
    return {
      white: {
        score: this.scoreTracking.white,
        display: `+${this.scoreTracking.white}`,
        show: this.scoreTracking.white > 0
      },
      black: {
        score: this.scoreTracking.black,
        display: `+${this.scoreTracking.black}`,
        show: this.scoreTracking.black > 0
      }
    };
  }

  /**
   * Reset the game
   */
  resetGame() {
    this.board = this.initBoard();
    this.moveHistory = [];
    this.currentPlayer = 'white';
    this.capturedPieces = { white: [], black: [] };
    this.scoreTracking = { white: 0, black: 0 };
  }
}

// ============================================================================
// 3. GAME EMOJIS CONFIGURATION
// ============================================================================

const GAME_EMOJIS = {
  chess: '♟️',           // Chess pawn
  tictactoe: '⭕',       // Tic Tac Toe
  rockpaperscissors: '✋', // Rock Paper Scissors
  among_us: '👽',        // Among Us
  connect4: '🔴',        // Connect 4
  checkers: '🔵',        // Checkers
  wordle: '📝',          // Wordle
  snake: '🐍',           // Snake
  tetris: '🟦',          // Tetris
  memory: '🧠',          // Memory
  battleship: '🚢',      // Battleship
  uno: '🎨',             // UNO
  default: '🎮'          // Default game emoji
};

/**
 * Get emoji for a game
 * @param {string} gameName - The game name
 * @returns {string} The appropriate emoji
 */
function getGameEmoji(gameName) {
  const normalized = gameName.toLowerCase().replace(/\s+/g, '_');
  return GAME_EMOJIS[normalized] || GAME_EMOJIS.default;
}

/**
 * Update game card emojis in the arcade
 */
function updateArcadeGameEmojis() {
  const gameCards = document.querySelectorAll('.arcade-card');
  gameCards.forEach(card => {
    const titleEl = card.querySelector('.arcade-card-title');
    if (titleEl) {
      const gameName = titleEl.textContent.trim();
      const emoji = getGameEmoji(gameName);
      
      // Update or add emoji icon
      const iconEl = card.querySelector('.arcade-icon');
      if (iconEl) {
        iconEl.textContent = emoji;
      }
    }
  });
}

/**
 * Display score indicator during chess game
 * @param {HTMLElement} container - The container to display scores
 * @param {Object} scoreData - Score data from chess game
 */
function displayChessScores(container, scoreData) {
  const whiteName = 'White';
  const blackName = 'Black';

  let scoreHTML = `
    <div style="display: flex; gap: 20px; justify-content: center; font-weight: 700; margin: 12px 0;">
  `;

  if (scoreData.white.show) {
    scoreHTML += `
      <div style="color: #fff; display: flex; align-items: center; gap: 6px;">
        ${whiteName}
        <span style="color: #22d3a0; font-size: 14px;">${scoreData.white.display}</span>
      </div>
    `;
  } else {
    scoreHTML += `<div style="color: #fff;">${whiteName}</div>`;
  }

  if (scoreData.black.show) {
    scoreHTML += `
      <div style="color: #a78bfa; display: flex; align-items: center; gap: 6px;">
        ${blackName}
        <span style="color: #22d3a0; font-size: 14px;">${scoreData.black.display}</span>
      </div>
    `;
  } else {
    scoreHTML += `<div style="color: #a78bfa;">${blackName}</div>`;
  }

  scoreHTML += `</div>`;
  container.innerHTML = scoreHTML;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize friend system
const friendSystem = new FriendSystem();

// Initialize chess game
const chessGame = new EnhancedChessGame();

// Initialize game emojis when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateArcadeGameEmojis);
} else {
  updateArcadeGameEmojis();
}

// ============================================================================
// EXPORT FOR USE IN HTML
// ============================================================================

// Make functions available globally
window.FriendSystem = FriendSystem;
window.EnhancedChessGame = EnhancedChessGame;
window.friendSystem = friendSystem;
window.chessGame = chessGame;
window.getGameEmoji = getGameEmoji;
window.displayChessScores = displayChessScores;
