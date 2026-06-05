import { BlogPost } from '../types';
import { AUTHORS } from './authors';
import { post as post1 } from './blogs/medicina-prepagada-ecuador';
import { post as post2 } from './blogs/examenes-preventivos-anuales';
import { post as post3 } from './blogs/cobertura-salud-familiar-maternidad';

export { AUTHORS };

export const BLOG_POSTS: BlogPost[] = [
  post1,
  post2,
  post3
];
