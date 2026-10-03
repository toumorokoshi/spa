# Kanji Battle Specification

AGENTS SHOULD NOT EDIT THIS FILE

## Shop

The player can use points to buy things from the shop.

The shop has:

- lego minifigures, or something like it.

## Scoring points

The player should have a point value that accumulates from playing multiple games. Scoring points will allow the player to purchase things from the shop.

The points are stored in local storage, so the user can return to their session.

## Game modes

### Point values

### Writing sentences

One of the mechanics is writing a sentence. A prompt shows up with a sentence in Japaneese. The player must write the sentence by writing the strokes.

The player should have to write the kanji from memory. showing the sentence in hiragana to the user is fine.

## Game mechanics

### Writing characters and kanji

The user should be able to write on the screen (i.e. with a stylus), which will result in a pattern match to see if it matches the desired character.

If the stroke order is incorrect, it tells the user as such and does not
accept the answer.

## Configuration

For configuration, there is a constants file that contains all of the Kanji that can be use to construct a sentence. These are the only kanji that can be used.
