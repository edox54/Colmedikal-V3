import { BlogPost } from '../types';
import { AUTHORS } from './authors';
import { post as post1 } from './blogs/medicina-prepagada-ecuador';
import { post as post2 } from './blogs/examenes-preventivos-anuales';
import { post as post3 } from './blogs/cobertura-salud-familiar-maternidad';
import { post as post4 } from './blogs/que-es-medicina-prepagada';
import { post as post5 } from './blogs/salud-publica-vs-medicina-prepagada';
import { post as post6 } from './blogs/seguro-salud-vs-medicina-prepagada';
import { post as post7 } from './blogs/medicina-prepagada-personas-jovenes';

export { AUTHORS };

export const BLOG_POSTS: BlogPost[] = [
  post1,
  post2,
  post3,
  post4,
  post5,
  post6,
  post7
];
