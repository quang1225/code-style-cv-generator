import type { ResumeData } from "../types/resume";
import defaultAvatarData from "./defaultAvatar.json";
import defaultResumeData from "./defaultResume.json";

const defaultResume: ResumeData = {
  ...defaultResumeData,
  ...defaultAvatarData,
};

export default defaultResume;
