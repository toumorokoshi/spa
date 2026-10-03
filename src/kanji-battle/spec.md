# Kanji Battle Specification

AGENTS SHOULD NOT EDIT THIS FILE

## Blind Boxes

The player receive a blind box with a minifigure inside it, after completing a round.

The experience is:

1. a box appears
2. the user clicks on the box
3. one of the minifigures, at random, appears
4. the minifigure is added to the players inventory. Duplicates are added and increase the count.

## Inventory

The player has the ability to view their inventory. This shows all purchased items and received minifigures.

## Scoring points

The player should have a point value that accumulates from playing multiple games. Scoring points will allow the player to purchase things from the shop.

The points are stored in local storage, so the user can return to their session.

## Game modes

### Writing sentences

One of the mechanics is writing a sentence. The player must come up with it themselves.

- The user is given 5 different kanji that they must use, written in hiragana.
- The player is shown a grid to write a sentence. The sentence is written top down, and right to left, in the same fashion that Japanese is typically written.
- The player writes a sentence.
- The player does not need to specify the hiragana they are writing before hand. They can just write each cell, then hit submit to move on to the next character. The evalution of correctness is done at the end.
  - For kanji, the player must select the kanji they are writing. then the game will enforce stroke order.
- After the player is finished writing sentences, the player submits them, and is scored based on the number of kanji that they have used from the list given.

The player should have to write the kanji from memory. showing the sentence in hiragana to the user is fine.

## Game mechanics

### Writing characters and kanji

The user should be able to write on the screen (i.e. with a stylus), which will result in a pattern match to see if it matches the desired character.

If the stroke order is incorrect, it tells the user as such and does not
accept the answer.

## Configuration

For configuration, before the a game mode begins, the user may select first the year of the kanji they want to practice, and then can select the specific kanji they want to practice for this session. The workflow is:

1. select the year of kanji.
2. select the kanji to practice.
3. start the game.

### Minifigures

The minifigure set includes, at minimum:

- A dinosaur minifigure
- A ninja
- A king
- A jester

There should be at least 20 minifigures
