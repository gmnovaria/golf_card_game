// src/App.tsx

import { useState } from 'react';
import type { GameState, GridSlot, Card, Suit } from './game/types';
import { createInitialGameState } from './game/setup';
import { flipGridCard } from './game/actions';
import {SUITS} from './game/types';

// Seating positions (indices into game.players)
const SOUTH_INDEX = 0; // Gage
const WEST_INDEX = 1;  // Player 2
const NORTH_INDEX = 2; // Player 3
const EAST_INDEX = 3;  // Player 4

const INITIAL_STATE: GameState = createInitialGameState([
  'Gage',      // South
  'Arnold',  // West
  'Jack',  // North
  'Tiger',  // East
]);

const suitSymbolMap: Record<Suit, string> = SUITS.reduce(
  (acc, suit) => {
    acc[suit.id] = suit.symbol;
    return acc;
  },
  {} as Record<Suit, string>
)

const suitColorMap: Record<Suit, string> = {
  hearts: '#ff4d4d',      // red
  diamonds: '#ff4d4d',    // red
  clubs: '#000000',       // black
  spades: '#000000',      // black
  hearts2: '#ff4d4d',     // red
  diamonds2: '#ff4d4d',   // red
  clubs2: '#000000',       // black
  spades2: '#000000',       // black
};

const cardBackPatternStyle = {
  backgroundColor: '#044718',
  backgroundImage: `
    repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.12) 0,
      rgba(255,255,255,0.12) 2px,
      transparent 2px,
      transparent 10px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255,255,255,0.12) 0,
      rgba(255,255,255,0.12) 2px,
      transparent 2px,
      transparent 10px
    )
  `,
  backgroundSize: '100% 100%'
};

function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);

  function handleGridClick(playerId: number, row: number, col: number) {
  setGame((prev) => flipGridCard(prev, playerId, row, col));
}

  const southPlayer = game.players[SOUTH_INDEX];
  const westPlayer = game.players[WEST_INDEX];
  const northPlayer = game.players[NORTH_INDEX];
  const eastPlayer = game.players[EAST_INDEX];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#00290c',
        color: 'white',
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>Card Game Prototype</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Turn: {game.turn} — Current Player:{' '}
        <strong>{game.players[game.currentPlayerId].name}</strong>
      </p>

            {/* Round table layout using CSS grid for symmetric spacing */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto',
          gridTemplateColumns: 'auto auto auto',
          rowGap: '3rem',      // vertical spacing between rows
          columnGap: '3rem',   // horizontal spacing between columns
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '1rem'
        }}
      >
        {/* North player (top center, rotated 180°) */}
        <div style={{ 
          gridRow: 1, gridColumn: 2, textAlign: 'center', marginBottom: '1rem' 
          }}>
          <PlayerPanel
            playerName={northPlayer.name}
            grid={northPlayer.grid}
            rotation={0}
            isCurrent={northPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(northPlayer.id, row, col)
            }
          />
        </div>

        {/* West player (middle left, rotated 90°) */}
        <div style={{ 
          gridRow: 1, gridColumn: 1, textAlign: 'center', transform: 'translateY(90px)' 
          }}>
          <PlayerPanel
            playerName={westPlayer.name}
            grid={westPlayer.grid}
            rotation={0}
            isCurrent={westPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(westPlayer.id, row, col)
            }
          />
        </div>

        {/* East player (middle right, rotated 270°) */}
        <div style={{ gridRow: 1, gridColumn: 3, textAlign: 'center', transform: 'translateY(90px)' }}>
          <PlayerPanel
            playerName={eastPlayer.name}
            grid={eastPlayer.grid}
            rotation={0}
            isCurrent={eastPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(eastPlayer.id, row, col)
            }
          />
        </div>

        {/* South player (bottom center, upright) */}
        <div style={{ gridRow: 2, gridColumn: 2, textAlign: 'center', }}>
          <PlayerPanel
            playerName={southPlayer.name}
            grid={southPlayer.grid}
            rotation={0}
            isCurrent={southPlayer.id === game.currentPlayerId}
            onCellClick={(row, col) =>
              handleGridClick(southPlayer.id, row, col)
            }
            size = "large"
          />
        </div>

        {/* Draw and Discard piles to the right of player's hand */}
        <div style={{ gridRow: 2, gridColumn: 3, textAlign: 'center', transform: 'translateY(20px)' }}>
          <CenterPiles
            drawCount={game.drawPile.length}
            discardCount={game.discardPile.length}
            topDiscardCard={game.discardPile[0] ?? null}
          />
        </div>

      </div>

    </div>
  );
}

interface PlayerPanelProps {
  playerName: string;
  grid: (GridSlot | null)[][];
  rotation: number; // degrees
  isCurrent: boolean;
  onCellClick?: (row: number, col: number) => void;
  size?: 'normal' | 'large';
}

function PlayerPanel({ 
  playerName, 
  grid, 
  rotation, 
  isCurrent, 
  onCellClick, 
  size,
}: PlayerPanelProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        opacity: isCurrent ? 1 : 0.75,
      }}
    >
      <div
        style={{
          border: isCurrent ? '2px solid #f6e05e' : '1px solid #4a5568',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          backgroundColor: '#2d3748',
        }}
      >
        <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
          {playerName}
          {isCurrent && ' (Your Turn)'}
        </div>
        <GridView grid={grid} onCellClick={onCellClick} size={size}/>
      </div>
    </div>
  );
}

interface GridViewProps {
  grid: (GridSlot | null)[][];
  onCellClick?: (row: number, col: number) => void;
  size?: 'normal' | 'large';
}

function GridView({ grid, onCellClick, size = 'normal' }: GridViewProps) {
  const isLarge = size === 'large';
  const cardWidth = isLarge ? 80 : 45;
  const cardHeight = isLarge ? 120 : 70;
  const centerFontSize = isLarge ? '2.7rem' : '1.5rem';
  const cornerFontSize = isLarge ? '1.5rem' : '0.9rem';
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${cardWidth}px)`,
        gridTemplateRows: `repeat(3, ${cardHeight}px)`,
        gap: isLarge ? '8px' : '4px',
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((slot, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;

          const handleClick = () => {
            if (onCellClick) {
              onCellClick(rowIndex, colIndex);
            }
          };

          if (!slot) {
            return (
              <div
                key={key}
                style={{
                  border: '1px solid #4a5568',
                  borderRadius: '6',
                  backgroundColor: '#1a202c',
                  width: cardWidth,
                  height: cardHeight,
                }}
              />
            );
          }

 const { card, faceUp } = slot;
          const isJoker = card.rank === 'Joker';
          const hasSuit = !!card.suit;
          const suitSymbol =
            hasSuit && card.suit ? suitSymbolMap[card.suit as Suit] : '';

          if (faceUp) {
  console.log('Face-up card:', card);
}
  
          // Face-down card
          if (!faceUp) {
            return (
              <div
                key={key}
                onClick={handleClick}
                style={{
                  border: '1px solid #044718',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: cardWidth,
                  height: cardHeight,
                  cursor: onCellClick ? 'pointer' : 'default',
                  userSelect: 'none',
                  ...cardBackPatternStyle,
                }}
              >
                <span
                  style={{
                    fontSize: isLarge? '2.7rem' : '1.5rem',
                    opacity: 0.9,
                  }}
                  >
                    ⛳
                  </span>
              </div>
            );
          }

          // Face-up card: rank in center, suit in 4 corners (if not Joker)
          return (
            <div
              key={key}
              onClick={handleClick}
              style={{
                position: 'relative',
                border: `2px solid ${hasSuit ? suitColorMap[card.suit as Suit] : '#ccc'}`,
                borderRadius: 6,
                width: cardWidth,
                height: cardHeight,
                backgroundColor: 'white',
                color: hasSuit ? suitColorMap[card.suit as Suit] : '#000',
                cursor: onCellClick ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {/* Center rank text */}
              <span style={{ fontSize: centerFontSize}}>
                {isJoker ? '🤡' : card.rank}
              </span>

              {/* Suit symbols in corners (skip if Joker or no suit) */}
              {hasSuit && !isJoker && (
                <>
                  {/* Top-left */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 6,
                      fontSize: cornerFontSize,
                      color: suitColorMap[card.suit as Suit],
                    }}
                  >
                    {suitSymbol}
                  </span>

                  {/* Top-right */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 6,
                      fontSize: cornerFontSize,
                      color: suitColorMap[card.suit as Suit],
                    }}
                  >
                    {suitSymbol}
                  </span>

                  {/* Bottom-left */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 6,
                      fontSize: cornerFontSize,
                      color: suitColorMap[card.suit as Suit],
                    }}
                  >
                    {suitSymbol}
                  </span>

                  {/* Bottom-right */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 6,
                      fontSize: cornerFontSize,
                      color: suitColorMap[card.suit as Suit],
                    }}
                  >
                    {suitSymbol}
                  </span>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

interface CenterPilesProps {
  drawCount: number;
  discardCount: number;
  topDiscardCard: Card | null;
}

/**
 * CenterPiles:
 * - Draw pile: face-down card
 * - Discard pile:
 *    - empty -> placeholder "DISCARD"
 *    - non-empty -> top card with rank in center + suit symbol in 4 corners
 */
function CenterPiles({
  drawCount,
  discardCount,
  topDiscardCard,
}: CenterPilesProps) {
  const cardWidth = 80;
  const cardHeight = 120;
  const borderRadius = 6;
  const centerFontSize = '2.7rem';
  const cornerFontSize = '1.5rem';

  const hasTopDiscard = discardCount > 0 && !!topDiscardCard;
  const isJoker = hasTopDiscard && topDiscardCard!.rank === 'Joker';
  const hasSuit = hasTopDiscard && !!topDiscardCard!.suit;
  const suitSymbol =
    hasSuit && topDiscardCard!.suit
      ? suitSymbolMap[topDiscardCard!.suit as Suit]
      : '';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.75rem', fontWeight: 600 }}></div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {/* Draw pile */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius,
              border: '2px solid #044718',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
              userSelect: 'none',
              ...cardBackPatternStyle,
            }}
          >
            <span
              style={{
                fontSize: centerFontSize,
                fontWeight: 600,
              }}
            >
              ⛳
            </span>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Cards: <strong>{drawCount}</strong>
          </div>
        </div>

        {/* Discard pile */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: cardWidth,
              height: cardHeight,
              borderRadius,
              border: '2px dashed #e2e8f0',
              backgroundColor: hasTopDiscard ? 'white' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
              color: hasTopDiscard ? 'white' : '#e2e8f0',
              userSelect: 'none',
            }}
          >
            {hasTopDiscard ? (
              <>
                {/* Center rank text */}
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: centerFontSize,
                    textAlign: 'center',
                    color: hasSuit ? suitColorMap[topDiscardCard!.suit as Suit] : '#000',
                  }}
                >
                  {isJoker ? 'JOKER' : topDiscardCard!.rank}
                </div>

                {/* Suit symbols in corners (skip if Joker or no suit) */}
                {hasSuit && !isJoker && (
                  <>
                    {/* Top-left */}
                    <span
                      style={{
                        position: 'absolute',
                        top: 4,
                        left: 6,
                        fontSize: cornerFontSize,
                        color: suitColorMap[topDiscardCard!.suit as Suit],
                      }}
                    >
                      {suitSymbol}
                    </span>

                    {/* Top-right */}
                    <span
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 6,
                        fontSize: cornerFontSize,
                        color: suitColorMap[topDiscardCard!.suit as Suit],
                      }}
                    >
                      {suitSymbol}
                    </span>

                    {/* Bottom-left */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        left: 6,
                        fontSize: cornerFontSize,
                        color: suitColorMap[topDiscardCard!.suit as Suit],
                      }}
                    >
                      {suitSymbol}
                    </span>

                    {/* Bottom-right */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 6,
                        fontSize: cornerFontSize,
                        color: suitColorMap[topDiscardCard!.suit as Suit],
                      }}
                    >
                      {suitSymbol}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span
                style={{
                  fontSize: centerFontSize,
                  fontWeight: 600,
                }}
              >
                DISCARD
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Cards: <strong>{discardCount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;