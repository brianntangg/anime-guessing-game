import type { QuestionPack } from '../../lib/types';

const shonen: QuestionPack = {
  id: 'shonen',
  name: 'Shonen Staples',
  description: 'Hunter x Hunter, Black Clover, Boruto, Dragon Ball Super, and more',
  questions: [
    {
      id: 'shonen-hxh-op1',
      type: 'audio-op-ed',
      answerMode: 'multiple-choice',
      mediaUrl: '/media/audio/hxh-op1.mp3',
      animeTitle: 'Hunter x Hunter',
      aliases: ['HxH', 'Hunter Hunter'],
      choices: [
        { id: 'A', text: 'Hunter x Hunter' },
        { id: 'B', text: 'Naruto' },
        { id: 'C', text: 'One Piece' },
        { id: 'D', text: 'Black Clover' },
      ],
      correctChoice: 'A',
      hint: 'Gon wants to find his father.',
    },
    {
      id: 'shonen-black-clover-op1',
      type: 'audio-op-ed',
      answerMode: 'multiple-choice',
      mediaUrl: '/media/audio/black-clover-op1.mp3',
      animeTitle: 'Black Clover',
      choices: [
        { id: 'A', text: 'My Hero Academia' },
        { id: 'B', text: 'Black Clover' },
        { id: 'C', text: 'Naruto' },
        { id: 'D', text: 'Boruto' },
      ],
      correctChoice: 'B',
      hint: 'Asta never gives up — ever.',
    },
    {
      id: 'shonen-boruto-op1',
      type: 'audio-op-ed',
      answerMode: 'multiple-choice',
      mediaUrl: '/media/audio/boruto-op1.mp3',
      animeTitle: 'Boruto',
      aliases: ['Boruto: Naruto Next Generations'],
      choices: [
        { id: 'A', text: 'Naruto Shippuden' },
        { id: 'B', text: 'Black Clover' },
        { id: 'C', text: 'Boruto' },
        { id: 'D', text: 'Blue Exorcist' },
      ],
      correctChoice: 'C',
      hint: "The son of the 7th Hokage.",
    },
    {
      id: 'shonen-dbs-op1',
      type: 'audio-op-ed',
      answerMode: 'free-text',
      mediaUrl: '/media/audio/dbs-op1.mp3',
      animeTitle: 'Dragon Ball Super',
      aliases: ['DBS'],
      choices: [],
      hint: 'Beyond Dragon Ball Z — Universe 7 vs the multiverse.',
    },
  ],
};

export default shonen;
