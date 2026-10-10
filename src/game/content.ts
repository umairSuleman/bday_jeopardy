import type { GameContent } from './types';

/**
 * Game content. To customise the game, edit this file and nothing else.
 * Any number of categories works; the board sizes itself to match.
 */
export const GAME: GameContent = {
  title: 'Mermaid Jeopardy',
  subtitle: 'Birthday Edition',

  categories: [
    /*
     * The answers in this category are personal, so they are left as TODOs on
     * purpose rather than guessed at. Fill each `response` in before playing.
     */
    {
      name: 'Mahek Questions',
      clues: [
        {
          value: 200,
          clue: 'The fast food place Mahek always ends up ordering from.',
          response: 'TODO: fill in the answer'
        },
        {
          value: 400,
          clue: 'The thing Mahek is most afraid of.',
          response: 'TODO: fill in the answer'
        },
        {
          value: 600,
          clue: "Mahek's single biggest pet peeve.",
          response: 'TODO: fill in the answer'
        },
        {
          value: 800,
          clue: "Mahek's very first pet, and the name it went by. Both halves are needed.",
          response: 'TODO: fill in the answer'
        },
        {
          value: 1000,
          clue: "Name one of Mahek's five favourite songs. Any of the top five counts.",
          response: 'TODO: fill in the answer (any of the top five)'
        }
      ]
    },

    {
      name: 'Pop Culture',
      clues: [
        {
          value: 200,
          clue: 'This billionaire and his then-partner Grimes named their son X Æ A-12.',
          response: 'Who is Elon Musk?'
        },
        {
          value: 400,
          clue: 'At the 2009 MTV Video Music Awards, he grabbed the mic from Taylor Swift to insist Beyoncé should have won.',
          response: 'Who is Kanye West?'
        },
        {
          value: 600,
          clue: 'Born in 1979, she is the eldest of the Kardashian sisters.',
          response: 'Who is Kourtney Kardashian?'
        },
        {
          value: 800,
          clue: 'In one of reality television\'s most quoted meltdowns, she lost a diamond earring in the ocean in Bora Bora.',
          response: 'Who is Kim Kardashian?'
        },
        {
          value: 1000,
          clue: 'This South Korean film became the first in a language other than English to win Best Picture.',
          response: 'What is "Parasite"?'
        }
      ]
    },

    {
      name: 'Music',
      clues: [
        {
          value: 200,
          clue: '"I tried so hard and got so far, but in the end it doesn\'t even matter" comes from this band\'s 2000 breakout.',
          response: 'Who is Linkin Park?'
        },
        {
          value: 400,
          clue: 'Justin Bieber released "Baby," featuring Ludacris, in this year.',
          response: 'What is 2010?'
        },
        {
          value: 600,
          // TODO: swap in the lyric from the "complete the song" list.
          clue: 'Complete the song: the host will read the line aloud.',
          response: 'TODO: fill in the lyric and its song'
        },
        {
          value: 800,
          clue: 'These two artists, one a Memphis rapper and one an R&B singer, are both featured on Drake\'s "Rich Baby Daddy."',
          response: 'Who are Sexyy Red and SZA?'
        },
        {
          value: 1000,
          clue: 'Mixtapes aside, this 2010 record was Drake\'s first proper studio album.',
          response: 'What is "Thank Me Later"?'
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
