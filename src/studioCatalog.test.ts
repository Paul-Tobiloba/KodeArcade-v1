import { describe, expect, it } from 'vitest';
import { studioCharacters, studioBackdrops, studioCharacterGroups, studioBackdropGroups, studioBackdropLabels, filteredStudioCharacters, filteredStudioBackdrops, characterImage, backgroundImage } from './studioCatalog';
import { newStudioProject, readStudioBackup, saveStudioProject, studioProjectSchema } from './studioProject';
import { readStudioGallery, saveStudioGallery } from '../shared/studioGallery';

const familyAndProps = ['Man', 'Woman', 'Grandma', 'Grandpa', 'House', 'Tree', 'Bicycle', 'Bus', 'Rocket', 'Horse', 'Butterfly', 'Fish'];
const scenes = ['cityStreet', 'countryHome', 'park', 'beach', 'classroom', 'space', 'underwater', 'forest'];
describe('expanded story-making catalog', () => {
  it.each(familyAndProps)('validates and preserves %s as a programmable sprite costume', name => {
    const p = newStudioProject(); p.assets[0].ref = name; p.assets[0].name = name;
    expect(studioCharacters).toContain(name); expect(characterImage(name)).toBe(`/images/studio/${name.toLowerCase()}.png`);
    expect(readStudioBackup(saveStudioProject(p))).toEqual(p);
  });
  it.each(scenes)('validates and preserves the %s scene without replacing an existing reference', ref => {
    const p = newStudioProject(); p.assets[1].ref = ref;
    expect(studioBackdrops).toContain(ref); expect(backgroundImage[ref]).toMatch(/^\/images\/studio\/.+-scene\.png$/);
    expect(studioProjectSchema.safeParse(p).success).toBe(true);
  });
  it('retains every earlier choice and its original image mapping', () => {
    expect(studioCharacters).toHaveLength(35); expect(studioBackdrops).toHaveLength(19);
    expect(new Set(studioCharacters).size).toBe(35); expect(new Set(studioBackdrops).size).toBe(19);
    expect(studioCharacters.slice(0, 15)).toEqual(['Byte', 'Dash', 'Gigi', 'Fix', 'Milo', 'Nova', 'Pip', 'Boy', 'Girl', 'Cat', 'Dog', 'Lion', 'Football', 'Basketball', 'Car']);
    expect(studioBackdrops.slice(0, 9)).toEqual(['sky', 'city', 'meadow', 'horizon', 'football', 'basketball', 'tennis', 'track', 'volleyball']);
    expect(backgroundImage.city).toBe('/images/adventure-sky.png'); expect(backgroundImage.cityStreet).not.toBe(backgroundImage.city);
  });
  it('gives every choice one useful category, with All preserving catalog order', () => {
    expect(filteredStudioCharacters('All', '')).toEqual(studioCharacters); expect(filteredStudioBackdrops('All', '')).toEqual(studioBackdrops);
    const groupedCharacters = studioCharacterGroups.filter(g => g !== 'All').flatMap(g => filteredStudioCharacters(g, ''));
    const groupedBackdrops = studioBackdropGroups.filter(g => g !== 'All').flatMap(g => filteredStudioBackdrops(g, ''));
    expect(new Set(groupedCharacters)).toEqual(new Set(studioCharacters)); expect(groupedCharacters).toHaveLength(35);
    expect(new Set(groupedBackdrops)).toEqual(new Set(studioBackdrops)); expect(groupedBackdrops).toHaveLength(19);
    expect(filteredStudioCharacters('People', '')).toEqual(['Boy', 'Girl', 'Man', 'Woman', 'Grandma', 'Grandpa', 'BasketballBoy', 'BasketballGirl']);
    expect(filteredStudioBackdrops('Places', '')).toEqual(['cityStreet', 'countryHome', 'classroom']);
  });
  it('supports child-friendly family, home and transport search words without regex interpretation', () => {
    expect(filteredStudioCharacters('People', ' ADULT ')).toEqual(['Man', 'Woman', 'Grandma', 'Grandpa']);
    expect(filteredStudioCharacters('All', 'grand ma')).toEqual(['Grandma']); expect(filteredStudioCharacters('All', 'grandfather')).toEqual(['Grandpa']);
    expect(filteredStudioCharacters('Things', 'bike')).toEqual(['Bicycle']); expect(filteredStudioCharacters('Things', 'home')).toEqual(['House']);
    expect(filteredStudioBackdrops('All', 'farm')).toEqual(['countryHome']); expect(filteredStudioBackdrops('Nature', 'ocean')).toEqual(['beach', 'underwater']);
    expect(filteredStudioBackdrops('All', '<script>')).toEqual([]); expect(filteredStudioCharacters('All', '.*')).toEqual([]);
  });
  it('combines search and category without changing the underlying catalog or saved artwork', () => {
    const p = newStudioProject(); p.assets[0].ref = 'Grandma'; p.assets[1].ref = 'countryHome';
    const gallery = readStudioGallery(saveStudioProject(p)), before = structuredClone(gallery);
    expect(filteredStudioCharacters('Animals', 'Grandma')).toEqual([]); expect(filteredStudioBackdrops('Sports', 'country')).toEqual([]);
    expect(readStudioGallery(saveStudioGallery(gallery))).toEqual(before);
    for (const ref of studioBackdrops) expect(studioBackdropLabels[ref].length).toBeGreaterThan(2);
  });
});
