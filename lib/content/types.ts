import type { Category, LearningPath, Project, Resource, Topic } from "@/types";

/** Everything the content layer can serve, regardless of source. */
export interface ContentBundle {
  categories: Category[];
  topics: Topic[];
  resources: Resource[];
  learningPaths: LearningPath[];
  projects: Project[];
}
