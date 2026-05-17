import { franc } from 'franc';
import natural from 'natural';
import { PROFANITY_WORDS_EN, PROFANITY_WORDS_UA } from './profanity-list';



export const containsProfanity = (text: string): { hasProfanity: boolean; words: string[] } => {
    if (!text || text.trim() === '') {
        return { hasProfanity: false, words: [] };
    }

    const cleanText = text.toLowerCase().replace(/[^\p{L}\s]/gu, ' ');

    const tokenizer = new natural.WordTokenizer();
    const words = tokenizer.tokenize(cleanText) || [];

    const lang = franc(text, { minLength: 3 });


    let activeDictionary: string[];
    switch (lang) {
        case 'ukr':
            activeDictionary = PROFANITY_WORDS_UA;
            break;
        case 'eng':
            activeDictionary = PROFANITY_WORDS_EN;
            break;
        default:
            activeDictionary = [...PROFANITY_WORDS_UA, ...PROFANITY_WORDS_EN];
            break;
    }


    const dictionarySet = new Set(activeDictionary);


    const profaneWords = words.filter(word => dictionarySet.has(word));

    return {
        hasProfanity: profaneWords.length > 0,
        words: profaneWords
    };
};