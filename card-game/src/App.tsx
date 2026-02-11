// src/App.tsx

import { useState } from 'react';
import type { Card, GameState, GridSlot, Suit } from './game/types';
import { SUITS } from './game/types';
import { createInitialGameState } from './game/setup';
import {
  chooseTurnCard,
  discardActiveDrawCard,
  flipGridCard,
  placeActiveCardInGrid,
} from './game/actions';

// Seating positions (indices into game.players)
const SOUTH_INDEX = 0; // Gage
const WEST_INDEX = 1; // Player 2
const NORTH_INDEX = 2; // Player 3
const EAST_INDEX = 3; // Player 4

const INITIAL_STATE: GameState = createInitialGameState([
  'Gage',
  'Arnold',
  'Jack',
  'Tiger',
]);

const suitSymbolMap: Record<Suit, string> = SUITS.reduce(
  (acc, suit) => {
    acc[suit.id] = suit.symbol;
    return acc;
  },
  {} as Record<Suit, string>,
);

const suitColorMap: Record<Suit, string> = {
  hearts: '#ff4d4d',
  diamonds: '#ff4d4d',
  clubs: '#000000',
  spades: '#000000',
  hearts2: '#ff4d4d',
  diamonds2: '#ff4d4d',
  clubs2: '#000000',
  spades2: '#000000',
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
  backgroundSize: '100% 100%',
};

function App() {
  const [game, setGame] = useState<GameState>(INITIAL_STATE);

  function handleGridClick(playerId: number, row: number, col: number) {
    setGame((prev) => {
      if (prev.phase === 'SETUP') {
        return flipGridCard(prev, playerId, row, col);
      }

      return placeActiveCardInGrid(prev, playerId, row, col);
    });
  }

  function handleDrawPileClick() {
    setGame((prev) => chooseTurnCard(prev, prev.currentPlayerId, 'Draw'));
  }

  function handleDiscardPileClick() {
    setGame((prev) => {
      if (prev.phase !== 'PLAYING') {
        return prev;
      }

      const playerId = prev.currentPlayerId;

      if (prev.activeCard && prev.activeCardSource === 'Draw') {
        return discardActiveDrawCard(prev, playerId);
      }

      if (!prev.activeCard) {
        return chooseTurnCard(prev, playerId, 'Discard');
      }

      return prev;
    });
  }

  function getGridClickHandler(playerId: number) {
    if (game.phase === 'SETUP') {
      return (row: number, col: number) => handleGridClick(playerId, row, col);
    }

    if (
      game.phase === 'PLAYING' &&
      playerId === game.currentPlayerId &&
      !!game.activeCard
    ) {
      return (row: number, col: number) => handleGridClick(playerId, row, col);
    }

    return undefined;
  }

  function getStatusText(): string {
    const current = game.players[game.currentPlayerId];

    if (game.phase === 'SETUP') {
      const remaining = current.initialFlipsRemaining;
      return `${current.name}: flip ${remaining} more card${remaining === 1 ? '' : 's'}.`;
    }

    if (!game.activeCard) {
      return `${current.name}: choose top Draw or top Discard.`;
    }

    if (game.activeCardSource === 'Draw') {
      return `${current.name}: place on any of your 9 cards, or click Discard to throw it away.`;
    }

    return `${current.name}: place the selected Discard card on any of your 9 cards.`;
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
      <p style={{ marginBottom: '0.4rem' }}>
        Turn: {game.turn} - Current Player: <strong>{game.players[game.currentPlayerId].name}</strong>
      </p>
      <p style={{ marginBottom: '1.5rem' }}>{getStatusText()}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto',
          gridTemplateColumns: 'auto auto auto',
          rowGap: '3rem',
          columnGap: '3rem',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '1rem',
        }}
      >
        <div style={{ gridRow: 1, gridColumn: 2, textAlign: 'center', marginBottom: '1rem' }}>
          <PlayerPanel
            playerName={northPlayer.name}
            grid={northPlayer.grid}
            rotation={0}
            isCurrent={northPlayer.id === game.currentPlayerId}
            onCellClick={getGridClickHandler(northPlayer.id)}
          />
        </div>

        <div style={{ gridRow: 1, gridColumn: 1, textAlign: 'center', transform: 'translateY(90px)' }}>
          <PlayerPanel
            playerName={westPlayer.name}
            grid={westPlayer.grid}
            rotation={0}
            isCurrent={westPlayer.id === game.currentPlayerId}
            onCellClick={getGridClickHandler(westPlayer.id)}
          />
        </div>

        <div style={{ gridRow: 1, gridColumn: 3, textAlign: 'center', transform: 'translateY(90px)' }}>
          <PlayerPanel
            playerName={eastPlayer.name}
            grid={eastPlayer.grid}
            rotation={0}
            isCurrent={eastPlayer.id === game.currentPlayerId}
            onCellClick={getGridClickHandler(eastPlayer.id)}
          />
        </div>

        <div style={{ gridRow: 2, gridColumn: 2, textAlign: 'center' }}>
          <PlayerPanel
            playerName={southPlayer.name}
            grid={southPlayer.grid}
            rotation={0}
            isCurrent={southPlayer.id === game.currentPlayerId}
            onCellClick={getGridClickHandler(southPlayer.id)}
            size="large"
          />
        </div>

        <div style={{ gridRow: 2, gridColumn: 3, textAlign: 'center', transform: 'translateY(20px)' }}>
          <CenterPiles
            drawCount={game.drawPile.length}
            discardCount={game.discardPile.length}
            topDiscardCard={game.discardPile[0] ?? null}
            activeCard={game.activeCard}
            activeCardSource={game.activeCardSource}
            onDrawClick={handleDrawPileClick}
            onDiscardClick={handleDiscardPileClick}
            canChooseDraw={game.phase === 'PLAYING' && !game.activeCard && game.drawPile.length > 0}
            canChooseDiscard={game.phase === 'PLAYING' && !game.activeCard && game.discardPile.length > 0}
            canDiscardActiveDraw={
              game.phase === 'PLAYING' &&
              !!game.activeCard &&
              game.activeCardSource === 'Draw'
            }
          />
        </div>
      </div>
    </div>
  );
}

interface PlayerPanelProps {
  playerName: string;
  grid: (GridSlot | null)[][];
  rotation: number;
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
          {isCurrent && ' (Current)'}
        </div>
        <GridView grid={grid} onCellClick={onCellClick} size={size} />
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
  const centerFontSize = isLarge ? '2.7rem' : '1.7rem';
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
                  borderRadius: 6,
                  backgroundColor: '#1a202c',
                  width: cardWidth,
                  height: cardHeight,
                }}
              />
            );
          }

          if (!slot.faceUp) {
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
                    fontSize: isLarge ? '2.5rem' : '1.7rem',
                    opacity: 0.9,
                    letterSpacing: '0.05em',
                    lineHeight: 1,
                    display: 'inline-block',
                    transform: 'translate(2px, -3px)', 
                  }}
                >
                  ⛳
                </span>
              </div>
            );
          }

          return (
            <FaceCard
              key={key}
              card={slot.card}
              width={cardWidth}
              height={cardHeight}
              centerFontSize={centerFontSize}
              cornerFontSize={cornerFontSize}
              clickable={!!onCellClick}
              onClick={handleClick}
            />
          );
        }),
      )}
    </div>
  );
}

interface CenterPilesProps {
  drawCount: number;
  discardCount: number;
  topDiscardCard: Card | null;
  activeCard: Card | null;
  activeCardSource: 'Draw' | 'Discard' | null;
  onDrawClick: () => void;
  onDiscardClick: () => void;
  canChooseDraw: boolean;
  canChooseDiscard: boolean;
  canDiscardActiveDraw: boolean;
}

function CenterPiles({
  drawCount,
  discardCount,
  topDiscardCard,
  activeCard,
  activeCardSource,
  onDrawClick,
  onDiscardClick,
  canChooseDraw,
  canChooseDiscard,
  canDiscardActiveDraw,
}: CenterPilesProps) {
  const cardWidth = 80;
  const cardHeight = 120;

  const discardClickable = canChooseDiscard || canDiscardActiveDraw;

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            onClick={onDrawClick}
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius: 6,
              border: canChooseDraw ? '2px solid #f6e05e' : '2px solid #044718',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
              cursor: canChooseDraw ? 'pointer' : 'default',
              userSelect: 'none',
              opacity: canChooseDraw ? 1 : 0.8,
              ...cardBackPatternStyle,
            }}
          >
            <span
              style={{
                fontSize: '2.5rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                lineHeight: 1,
                display: 'inline-block',
                transform: 'translate(2px, -3px)',
              }}
            >
              ⛳
            </span>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Cards: <strong>{drawCount}</strong>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            onClick={onDiscardClick}
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius: 6,
              border: discardClickable ? '2px solid #f6e05e' : '2px dashed #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.25rem',
              cursor: discardClickable ? 'pointer' : 'default',
              userSelect: 'none',
              opacity: discardClickable || topDiscardCard ? 1 : 0.8,
              backgroundColor: topDiscardCard ? 'white' : 'transparent',
            }}
          >
            {topDiscardCard ? (
              <FaceCard
                card={topDiscardCard}
                width={cardWidth}
                height={cardHeight}
                centerFontSize="2.7rem"
                cornerFontSize="1.5rem"
              />
            ) : (
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>DISCARD</span>
            )}
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Cards: <strong>{discardCount}</strong>
          </div>
        </div>

        {activeCard && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
              In Hand ({activeCardSource})
            </div>
            <FaceCard
              card={activeCard}
              width={cardWidth}
              height={cardHeight}
              centerFontSize="2.7rem"
              cornerFontSize="1.5rem"
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface FaceCardProps {
  card: Card;
  width: number;
  height: number;
  centerFontSize: string;
  cornerFontSize: string;
  clickable?: boolean;
  onClick?: () => void;
}

function FaceCard({
  card,
  width,
  height,
  centerFontSize,
  cornerFontSize,
  clickable = false,
  onClick,
}: FaceCardProps) {
  const isJoker = card.rank === 'Joker';
  const hasSuit = !!card.suit;
  const suitSymbol = hasSuit && card.suit ? suitSymbolMap[card.suit as Suit] : '';

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        border: `2px solid ${hasSuit ? suitColorMap[card.suit as Suit] : '#ccc'}`,
        borderRadius: 6,
        width,
        height,
        backgroundColor: 'white',
        color: hasSuit ? suitColorMap[card.suit as Suit] : '#000',
        cursor: clickable ? 'pointer' : 'default',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontSize: centerFontSize }}>{isJoker ? '🤡' : card.rank}</span>

      {hasSuit && !isJoker && (
        <>
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
}

export default App;
