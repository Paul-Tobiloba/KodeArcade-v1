import { Sun, Moon, Star, Flower2, Fish, Bird, TreePine, Apple, Rocket, Heart, Cat, Dog, CircleDot, Leaf, Bug, Bot } from 'lucide-react';

// Stable IDs are the credential alphabet. Never reorder or rename an existing ID.
export const pictures = [
  { id: 'sun', name: 'Sun', icon: Sun }, { id: 'moon', name: 'Moon', icon: Moon },
  { id: 'star', name: 'Star', icon: Star }, { id: 'flower', name: 'Flower', icon: Flower2 },
  { id: 'fish', name: 'Fish', icon: Fish }, { id: 'bird', name: 'Bird', icon: Bird },
  { id: 'tree', name: 'Tree', icon: TreePine }, { id: 'apple', name: 'Apple', icon: Apple },
  { id: 'rocket', name: 'Rocket', icon: Rocket }, { id: 'heart', name: 'Heart', icon: Heart },
  { id: 'cat', name: 'Cat', icon: Cat }, { id: 'dog', name: 'Dog', icon: Dog },
  { id: 'ball', name: 'Ball', icon: CircleDot }, { id: 'leaf', name: 'Leaf', icon: Leaf },
  { id: 'bug', name: 'Bug', icon: Bug }, { id: 'robot', name: 'Robot', icon: Bot },
] as const;
export const pictureIds: readonly string[] = pictures.map(picture => picture.id);
