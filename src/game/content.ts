import type { GameContent } from './types';

/**
 * Game content. To customise the game, edit this file and nothing else.
 * Any number of categories works; the board sizes itself to match.
 */
export const GAME: GameContent = {
  title: 'Mermaid Jeopardy',
  subtitle: 'Birthday Edition',

  categories: [
    {
      name: 'Birthday Classics',
      clues: [
        {
          value: 200,
          clue: 'The melody of "Happy Birthday to You" was lifted from this classroom greeting song, written by the Hill sisters in 1893.',
          response: 'What is "Good Morning to All"?'
        },
        {
          value: 400,
          clue: 'In Mexico, birthdays traditionally begin with this "little mornings" serenade rather than "Happy Birthday."',
          response: 'What is "Las Mañanitas"?'
        },
        {
          value: 600,
          clue: "Across Latin America, this celebration marks a girl's fifteenth birthday with a gown, a waltz, and a very large party.",
          response: 'What is a quinceañera?'
        },
        {
          value: 800,
          clue: 'At this Korean first-birthday celebration, the baby is offered a table of symbolic objects, and whatever they grab is said to hint at their future.',
          response: 'What is doljanchi (or dol)?'
        },
        {
          value: 1000,
          clue: 'In a room of just 23 people, the odds that two of them share a birthday climb past 50 percent, a result known as the birthday this.',
          response: 'What is the birthday paradox (or problem)?'
        }
      ]
    },

    {
      name: 'Cake & Candles',
      clues: [
        {
          value: 200,
          clue: 'Sodium bicarbonate is the chemical name for this pantry leavener that gives a cake its lift.',
          response: 'What is baking soda?'
        },
        {
          value: 400,
          clue: 'Baked in a tube pan from whipped egg whites with no butter at all, this cloud of a dessert has a heavenly name.',
          response: 'What is angel food cake?'
        },
        {
          value: 600,
          clue: 'Layers of chocolate sponge, whipped cream, and kirsch-soaked cherries make up this German cake named for a forest.',
          response: 'What is Black Forest cake?'
        },
        {
          value: 800,
          clue: 'Meaning "burnt cream" in French, this custard gets a torched sugar crust just before serving.',
          response: 'What is crème brûlée?'
        },
        {
          value: 1000,
          clue: 'Its name means "a thousand leaves" in French, and it stacks puff pastry with pastry cream.',
          response: 'What is a mille-feuille?'
        }
      ]
    },

    {
      name: 'Pop Culture Birthdays',
      clues: [
        {
          value: 200,
          clue: 'This Beatles track from the White Album is built almost entirely around the line "they say it\'s your birthday."',
          response: 'What is "Birthday"?'
        },
        {
          value: 400,
          clue: "In this 1984 John Hughes film, Samantha Baker's family is so consumed by her sister's wedding that they forget her sixteenth birthday.",
          response: 'What is "Sixteen Candles"?'
        },
        {
          value: 600,
          clue: 'In 1962, Marilyn Monroe purred "Happy Birthday, Mr. President" at a Madison Square Garden gala for this man.',
          response: 'Who is John F. Kennedy?'
        },
        {
          value: 800,
          clue: '"Go, go, go, go... it\'s your birthday" opens this rapper\'s 2003 smash "In da Club."',
          response: 'Who is 50 Cent?'
        },
        {
          value: 1000,
          clue: "Stevie Wonder's 1980 song \"Happy Birthday\" was a campaign anthem for a national holiday honouring this man.",
          response: 'Who is Martin Luther King Jr.?'
        }
      ]
    },

    {
      name: 'Under the Sea',
      clues: [
        {
          value: 200,
          clue: 'Stretching some 1,400 miles along the Australian coast, this is the largest living structure on Earth.',
          response: 'What is the Great Barrier Reef?'
        },
        {
          value: 400,
          clue: 'Long before mermaids, these half-bird women of Greek myth were the ones luring sailors to their doom with song.',
          response: 'What are the Sirens?'
        },
        {
          value: 600,
          clue: 'The deepest known point in any ocean, it sits at the southern end of the Mariana Trench.',
          response: 'What is Challenger Deep?'
        },
        {
          value: 800,
          clue: 'Hans Christian Andersen published this 1837 fairy tale about a sea princess who trades her voice for a pair of legs.',
          response: 'What is "The Little Mermaid"?'
        },
        {
          value: 1000,
          clue: 'An octopus gets by on this many hearts, two pumping blood to the gills and one to the rest of the body.',
          response: 'What is three?'
        }
      ]
    },

    {
      name: 'Party Games',
      clues: [
        {
          value: 200,
          clue: 'Blindfolded, spun around, and handed a paper appendage, players stumble toward a poster in this classic.',
          response: 'What is Pin the Tail on the Donkey?'
        },
        {
          value: 400,
          clue: 'Candy rains down when this papier-mâché figure finally gives way to the stick.',
          response: 'What is a piñata?'
        },
        {
          value: 600,
          clue: 'Players circle a row of seats with one chair too few, and the music stopping is the whole point of this game.',
          response: 'What is musical chairs?'
        },
        {
          value: 800,
          clue: 'This reverse hide-and-seek has every seeker who finds the hider cram silently into the same spot, packing in like the fish it is named for.',
          response: 'What is Sardines?'
        },
        {
          value: 1000,
          clue: 'A spinner calls out limbs and colours, sending players into a knot on a mat of coloured dots in this 1966 game.',
          response: 'What is Twister?'
        }
      ]
    },

    {
      name: 'Potluck',
      clues: [
        {
          value: 200,
          clue: 'Iron oxide dust gives this fourth planet from the Sun its nickname, the Red Planet.',
          response: 'What is Mars?'
        },
        {
          value: 400,
          clue: 'It is the only letter of the alphabet that does not appear in the name of any U.S. state.',
          response: 'What is Q?'
        },
        {
          value: 600,
          clue: 'From the Latin "aurum," this element claims the symbol Au on the periodic table.',
          response: 'What is gold?'
        },
        {
          value: 800,
          clue: 'A gathering of flamingos goes by this flashy collective noun.',
          response: 'What is a flamboyance?'
        },
        {
          value: 1000,
          clue: 'Gliding squirrels only glide, which leaves this creature as the only mammal capable of true, powered flight.',
          response: 'What is a bat?'
        }
      ]
    }
  ]
};
