import type { QuestionPack } from '../../lib/types';

const isekai: QuestionPack = {
  id: 'isekai',
  name: 'Isekai & Fantasy',
  description: 'Re:Zero, SAO, KonoSuba, That Time I Got Reincarnated as a Slime',
  questions: [
    {
      id: 'isekai-rezero-op1',
      type: 'audio-op-ed',
      answerMode: 'multiple-choice',
      mediaUrl: '/media/audio/rezero-op1.mp3',
      animeTitle: 'Re:Zero',
      aliases: ['Re Zero', 'Re:Zero − Starting Life in Another World'],
      choices: [
        { id: 'A', text: 'Re:Zero' },
        { id: 'B', text: 'Sword Art Online' },
        { id: 'C', text: 'Overlord' },
        { id: 'D', text: 'That Time I Got Reincarnated as a Slime' },
      ],
      correctChoice: 'A',
      hint: 'Return by death — again and again.',
    },
    {
      id: 'isekai-sao-op1',
      type: 'audio-op-ed',
      answerMode: 'multiple-choice',
      mediaUrl: '/media/audio/sao-op1.mp3',
      animeTitle: 'Sword Art Online',
      aliases: ['SAO'],
      choices: [
        { id: 'A', text: 'Log Horizon' },
        { id: 'B', text: 'Overlord' },
        { id: 'C', text: 'KonoSuba' },
        { id: 'D', text: 'Sword Art Online' },
      ],
      correctChoice: 'D',
      hint: 'Trapped in a virtual reality MMO.',
    },
    {
      id: 'isekai-konosuba-op1',
      type: 'audio-op-ed',
      answerMode: 'multiple-choice',
      mediaUrl: '/media/audio/konosuba-op1.mp3',
      animeTitle: 'KonoSuba',
      aliases: ['Konosuba', "KonoSuba: God's Blessing on This Wonderful World"],
      choices: [
        { id: 'A', text: 'KonoSuba' },
        { id: 'B', text: 'Re:Zero' },
        { id: 'C', text: 'That Time I Got Reincarnated as a Slime' },
        { id: 'D', text: 'No Game No Life' },
      ],
      correctChoice: 'A',
      hint: 'A useless goddess and a very unlucky protagonist.',
    },
    {
      id: 'isekai-tensura-op1',
      type: 'audio-op-ed',
      answerMode: 'multiple-choice',
      mediaUrl: '/media/audio/tensura-op1.mp3',
      animeTitle: 'That Time I Got Reincarnated as a Slime',
      aliases: ['Tensura', 'TenSura', 'Slime Isekai', 'Rimuru'],
      choices: [
        { id: 'A', text: 'Overlord' },
        { id: 'B', text: 'That Time I Got Reincarnated as a Slime' },
        { id: 'C', text: 'Sword Art Online' },
        { id: 'D', text: 'The Rising of the Shield Hero' },
      ],
      correctChoice: 'B',
      hint: 'Rimuru Tempest was just a regular office worker.',
    },
  ],
};

export default isekai;
