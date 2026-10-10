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
      name: '5th Grade Science',
      clues: [
        {
          value: 200,
          clue: 'Water vapour cooling back into liquid droplets is this step of the water cycle, the one that forms clouds and dew.',
          response: 'What is condensation?'
        },
        {
          value: 400,
          clue: 'Plants trap sunlight with this green pigment, which is also what gives leaves their colour.',
          response: 'What is chlorophyll?'
        },
        {
          value: 600,
          clue: 'Measured in kilograms, this property of an object is exactly the same on the Moon even though its weight is not.',
          response: 'What is mass?'
        },
        {
          value: 800,
          clue: 'Magma or lava that cools and hardens becomes this one of the three main rock types.',
          response: 'What is igneous rock?'
        },
        {
          value: 1000,
          clue: 'Protons and neutrons are packed into the nucleus of this smallest unit of an element.',
          response: 'What is an atom?'
        }
      ]
    },

    {
      name: 'Geography',
      clues: [
        {
          value: 200,
          clue: 'Covering about a third of the planet, it is the largest and deepest of the oceans.',
          response: 'What is the Pacific Ocean?'
        },
        {
          value: 400,
          clue: 'This river runs north through Egypt and empties into the Mediterranean Sea.',
          response: 'What is the Nile?'
        },
        {
          value: 600,
          clue: 'Climbers reach the summit of Mount Everest from Nepal or from this country on its northern side.',
          response: 'What is China?'
        },
        {
          value: 800,
          clue: 'The largest desert on Earth is not the Sahara but this frozen continent, which gets almost no precipitation.',
          response: 'What is Antarctica?'
        },
        {
          value: 1000,
          clue: 'Africa\'s highest peak, Mount Kilimanjaro, stands in this country rather than in neighbouring Kenya.',
          response: 'What is Tanzania?'
        }
      ]
    },

    {
      name: 'Disney',
      clues: [
        {
          value: 200,
          clue: 'A glass slipper left behind on the palace steps belongs to this heroine.',
          response: 'Who is Cinderella?'
        },
        {
          value: 400,
          clue: 'Released in 1937, it was the studio\'s first full-length animated feature.',
          response: 'What is "Snow White and the Seven Dwarfs"?'
        },
        {
          value: 600,
          clue: 'This treacherous lion kills his brother Mufasa and takes over Pride Rock.',
          response: 'Who is Scar?'
        },
        {
          value: 800,
          clue: 'This 1940 film set animation to classical music, and cast Mickey as a sorcerer\'s apprentice.',
          response: 'What is "Fantasia"?'
        },
        {
          value: 1000,
          clue: 'Walt originally wanted to call Mickey by this name, until his wife Lillian talked him out of it.',
          response: 'What is Mortimer?'
        }
      ]
    }
  ]
};
