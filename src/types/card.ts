/**
 * Shared card type definitions to avoid circular dependencies
 * Used throughout the blackjack game for representing playing cards
 */

/**
 * Card suit enumeration
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/**
 * Card value/rank enumeration
 */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/**
 * Color of a card (red or black)
 */
export type CardColor = 'red' | 'black';

/**
 * Card back design options
 */
export type CardBackOption =
  | 'blue'
  | 'red'
  | 'abstract'
  | 'abstract_scene'
  | 'abstract_clouds'
  | 'astronaut'
  | 'cars'
  | 'castle'
  | 'fish'
  | 'frog';

/**
 * Represents a playing card in the deck
 */
export interface Card {
  /**
   * Card suit (hearts, diamonds, clubs, spades)
   */
  suit: Suit;

  /**
   * Card value/rank (A, 2-10, J, Q, K)
   */
  value: Rank;

  /**
   * Whether the card is face up (true) or face down (false)
   * @default false
   */
  faceUp?: boolean;

  /**
   * Unique identifier for the card (for React keys)
   * Optional but recommended for card tracking in components
   */
  id?: string;
}

/**
 * Maps card values to their numeric blackjack values
 */
export const CARD_VALUES: Record<Rank, number[]> = {
  'A': [1, 11],
  '2': [2],
  '3': [3],
  '4': [4],
  '5': [5],
  '6': [6],
  '7': [7],
  '8': [8],
  '9': [9],
  '10': [10],
  'J': [10],
  'Q': [10],
  'K': [10]
};

/**
 * Maps suits to their colors
 */
export const SUIT_COLORS: Record<Suit, CardColor> = {
  'hearts': 'red',
  'diamonds': 'red',
  'clubs': 'black',
  'spades': 'black'
};

/**
 * Utility type for a card that is guaranteed to have an ID
 */
export type CardWithId = Required<Pick<Card, 'id'>> & Card;

/**
 * Utility type for a face-up card
 */
export type FaceUpCard = Card & { faceUp: true };

/**
 * Utility type for a face-down card
 */
export type FaceDownCard = Card & { faceUp: false };