import { spriteNames, backdropNames } from './spriteModel.js';

// Keep this free-build catalog separate from the guided courses' mascots.
export const studioCharacters = [...spriteNames, 'Boy', 'Girl', 'Cat', 'Dog', 'Lion', 'Football', 'Basketball', 'Car', 'Man', 'Woman', 'Grandma', 'Grandpa', 'House', 'Tree', 'Bicycle', 'Bus', 'Rocket', 'Horse', 'Butterfly', 'Fish', 'RaceCarRed', 'RaceCarBlue', 'RaceCarYellow', 'BasketballBoy', 'BasketballGirl', 'BasketballHoop', 'TennisBall', 'TennisRacket'] as const;
export const studioBackdrops = [...backdropNames, 'football', 'basketball', 'tennis', 'track', 'volleyball', 'cityStreet', 'countryHome', 'park', 'beach', 'classroom', 'space', 'underwater', 'forest', 'racing', 'basketballGame'] as const;
export const studioBackdropLabels: Record<typeof studioBackdrops[number], string> = {
  sky: 'Floating islands', city: 'Adventure city', meadow: 'Green meadow', horizon: 'Journey horizon',
  football: 'Football field', basketball: 'Basketball court', tennis: 'Tennis court', track: 'Race track', volleyball: 'Volleyball court',
  cityStreet: 'City street', countryHome: 'Country home', park: 'Playground park', beach: 'Sunny beach', classroom: 'Classroom', space: 'Outer space', underwater: 'Underwater', forest: 'Forest clearing',
  racing: 'Three-lane speedway', basketballGame: 'Basketball bounce court',
};
export const backgroundImage: Record<string, string> = {
  sky: '/images/auth/island-world.png', city: '/images/adventure-sky.png', meadow: '/images/meadow-board.png', horizon: '/images/journey-horizon.png',
  ...Object.fromEntries(['football', 'basketball', 'tennis', 'track', 'volleyball'].map(name => [name, `/images/studio/${name}-court.svg`])),
  cityStreet: '/images/studio/city-street-scene.png', countryHome: '/images/studio/country-home-scene.png',
  ...Object.fromEntries(['park', 'beach', 'classroom', 'space', 'underwater', 'forest'].map(name => [name, `/images/studio/${name}-scene.png`])),
  racing: '/images/studio/racing-lanes.svg', basketballGame: '/images/studio/basketball-game.svg',
};
export const characterIsAtlas = (ref: string) => spriteNames.includes(ref as never);
export const characterImage = (ref: string) => characterIsAtlas(ref) ? `/images/worlds/${ref.toLowerCase()}.png` : `/images/studio/${ref.toLowerCase()}.png`;
export const studioCharacterLabel = (ref: string) => ({ RaceCarRed: 'Red racing car', RaceCarBlue: 'Blue rally car', RaceCarYellow: 'Yellow compact car', BasketballBoy: 'Basketball boy', BasketballGirl: 'Basketball girl', BasketballHoop: 'Basketball hoop', TennisBall: 'Tennis ball', TennisRacket: 'Tennis racket' } as Record<string, string>)[ref] ?? ref;

export const studioCharacterGroups = ['All', 'People', 'Animals', 'Things'] as const;
export const studioBackdropGroups = ['All', 'Places', 'Nature', 'Sports', 'Fantasy'] as const;
const people = new Set(['Boy', 'Girl', 'Man', 'Woman', 'Grandma', 'Grandpa', 'BasketballBoy', 'BasketballGirl']);
const animals = new Set(['Dash', 'Gigi', 'Fix', 'Milo', 'Nova', 'Pip', 'Cat', 'Dog', 'Lion', 'Horse', 'Butterfly', 'Fish']);
export const studioCharacterGroup = (name: string) => people.has(name) ? 'People' : animals.has(name) ? 'Animals' : 'Things';
export const studioBackdropGroup = (ref: string) => ['cityStreet', 'countryHome', 'classroom'].includes(ref) ? 'Places' : ['meadow', 'park', 'beach', 'underwater', 'forest'].includes(ref) ? 'Nature' : ['football', 'basketball', 'tennis', 'track', 'volleyball', 'racing', 'basketballGame'].includes(ref) ? 'Sports' : 'Fantasy';
const aliases: Record<string, string> = {
  Man: 'adult dad father parent', Woman: 'adult mum mom mother parent', Grandma: 'adult grandmother granny nan grand ma', Grandpa: 'adult grandfather granddad grand pa',
  House: 'home cottage building', Tree: 'plant nature', Bicycle: 'bike cycle transport', Bus: 'school bus vehicle transport', Rocket: 'spaceship space rocket',
  Horse: 'pony animal', Butterfly: 'insect animal', Fish: 'ocean sea animal', Boy: 'child kid', Girl: 'child kid',
  cityStreet: 'city town street buildings urban', countryHome: 'house cottage village countryside farm rural', park: 'playground swings garden', beach: 'sea ocean sand seaside',
  classroom: 'school learning room', space: 'moon planets stars galaxy', underwater: 'ocean sea coral', forest: 'woods trees woodland',
  RaceCarRed: 'red racing car top view coupe', RaceCarBlue: 'blue racing car top view rally', RaceCarYellow: 'yellow racing car top view compact', BasketballBoy: 'basketball player boy sport', BasketballGirl: 'basketball player girl sport', BasketballHoop: 'basketball net hoop basket sport',
};
const searchable = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, '');
const matches = (ref: string, label: string, query: string) => searchable(`${ref} ${label} ${aliases[ref] ?? ''}`).includes(searchable(query));
export const filteredStudioCharacters = (group: string, query: string) => studioCharacters.filter(name => (group === 'All' || studioCharacterGroup(name) === group) && matches(name, studioCharacterLabel(name), query));
export const filteredStudioBackdrops = (group: string, query: string) => studioBackdrops.filter(ref => (group === 'All' || studioBackdropGroup(ref) === group) && matches(ref, studioBackdropLabels[ref], query));
