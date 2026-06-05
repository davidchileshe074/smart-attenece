export type CatalogCourse = {
  code: string;
  title: string;
};

export type CatalogProgram = {
  key: string;
  label: string;
  courses: CatalogCourse[];
};

export const COURSE_CATALOG: CatalogProgram[] = [
  {
    key: 'bsc-com-new',
    label: 'Bachelor of Science in Computing (B.Sc COM) NEW',
    courses: [
      { code: 'IT111', title: 'Computer Applications' },
      { code: 'IT112', title: 'Computer Programming I' },
      { code: 'IT113', title: 'Fundamentals of Computer Systems' },
      { code: 'IT114', title: 'Foundation Mathematics I' },
      { code: 'IT121', title: 'Data Structure' },
      { code: 'IT123', title: 'Computer Programming II' },
      { code: 'IT211', title: 'Systems Analysis and Design' },
      { code: 'IT212', title: 'Database Management Systems' },
      { code: 'IT214', title: 'Operating Systems' },
      { code: 'IT221', title: 'Digital Logic' },
      { code: 'IT312', title: 'Algorithms and Complexity' },
      { code: 'IT321', title: 'Web Applications Development' },
      { code: 'IT323', title: 'Software Engineering' },
      { code: 'IT324', title: 'Artificial Intelligence' },
      { code: 'IT411', title: 'Programming Languages' },
      { code: 'IT413', title: 'Mobile Applications Development' },
      { code: 'IT424', title: 'Computer Ethics' },
    ],
  },
  {
    key: 'bsc-pm-new',
    label: 'Bachelor of Science in Project Management (B.Sc PM) NEW',
    courses: [
      { code: 'PM113', title: 'Introduction to Project Management' },
      { code: 'EC111', title: 'Introduction to Economics' },
      { code: 'AC111', title: 'Principles of Financial Accounting' },
      { code: 'CU115', title: 'Business Mathematics' },
      { code: 'BA115', title: 'Business and Academic Communication' },
      { code: 'CU121', title: 'Critical Thinking and Business Mindset' },
      { code: 'BA125', title: 'Principles of Management' },
      { code: 'PM126', title: 'Project Management Applications' },
      { code: 'PM224', title: 'Project Initiation' },
      { code: 'PM225', title: 'Project Planning' },
      { code: 'PM313', title: 'Project Implementation' },
      { code: 'PM322', title: 'Procurement and Stores Management' },
      { code: 'PM413', title: 'Monitoring and Control' },
      { code: 'PM415', title: 'Project Financing' },
      { code: 'PM422', title: 'Communication and Reporting' },
    ],
  },
  {
    key: 'bds-new',
    label: 'Bachelor of Development Studies (BDS) NEW',
    courses: [
      { code: 'EC111', title: 'Introduction to Economics' },
      { code: 'IT111', title: 'Computer Applications' },
      { code: 'SO111', title: 'Fundamentals of Sociology' },
      { code: 'PY111', title: 'Fundamentals of Psychology' },
      { code: 'BA115', title: 'Business and Academic Communication' },
      { code: 'CU121', title: 'Critical Thinking and Business Mindset' },
      { code: 'DS121', title: 'Introduction to Development Studies' },
      { code: 'DS122', title: 'Contemporary Issues of Development' },
      { code: 'DS211', title: 'Theories of Development' },
      { code: 'DS223', title: 'Project Planning and Management' },
      { code: 'DS311', title: 'Non-governmental Organization and Development' },
      { code: 'DS322', title: 'Development Policy Analysis' },
      { code: 'DS423', title: 'Food Security and Nutrition' },
      { code: 'SS413', title: 'Monitoring and Evaluation' },
      { code: 'CU425', title: 'Industrial Placement' },
    ],
  },
  {
    key: 'bsw-new',
    label: 'Bachelor of Social Work (BSW) NEW',
    courses: [
      { code: 'EC111', title: 'Introduction to Economics' },
      { code: 'SO111', title: 'Fundamentals of Sociology' },
      { code: 'PY111', title: 'Fundamentals of Psychology' },
      { code: 'IT111', title: 'Computer Applications' },
      { code: 'BA115', title: 'Business and Academic Communication' },
      { code: 'SW121', title: 'Introduction to Social Work' },
      { code: 'CU121', title: 'Critical Thinking and Business Mindset' },
      { code: 'SW211', title: 'Introduction to Social Welfare' },
      { code: 'SW214', title: "Children's Rights and Development" },
      { code: 'SW221', title: 'Legal Aspects of Social Work' },
      { code: 'SW223', title: 'Social Theory and Policy' },
      { code: 'SW311', title: 'Social Work Methods' },
      { code: 'SW323', title: 'Social Work and Leadership' },
      { code: 'SW413', title: 'Social Work and Rural Development' },
      { code: 'SW421', title: 'Block Placement' },
    ],
  },
  {
    key: 'bae-mi-new',
    label: 'Bachelor of Arts in Education Mathematics and ICT (BAE-MI) NEW',
    courses: [
      { code: 'BA115', title: 'Business and Academic Communication' },
      { code: 'ED112', title: 'Sociology of Education' },
      { code: 'ED113', title: 'Psychology of Education' },
      { code: 'IT111', title: 'Computer Applications' },
      { code: 'IT112', title: 'Computer Programming I' },
      { code: 'IT123', title: 'Computer Programming II' },
      { code: 'CU121', title: 'Critical Thinking and Business Mindset' },
      { code: 'ED121', title: 'Philosophy of Education' },
      { code: 'CM121', title: 'Foundation Mathematics' },
      { code: 'CM122', title: 'Discrete Mathematics' },
      { code: 'IT211', title: 'Systems Analysis and Design' },
      { code: 'ED225', title: 'Educational Technology and Digital Literacy' },
      { code: 'CM313', title: 'Teaching Methods in Mathematics' },
      { code: 'IT321', title: 'Web Applications Development' },
      { code: 'ED321', title: 'Teaching Practice' },
      { code: 'IT424', title: 'Computer Ethics' },
    ],
  },
  {
    key: 'bmcpr-new',
    label: 'Bachelor of Arts in Mass Communication and Public Relations (BMCPR) NEW',
    courses: [
      { code: 'CP112', title: 'Basics of Broadcasting' },
      { code: 'CP111', title: 'Introduction to Journalism and Mass Communication' },
      { code: 'BA115', title: 'Business and Academic Communication' },
      { code: 'IT111', title: 'Computer Applications' },
      { code: 'CU121', title: 'Critical Thinking and Business Mindset' },
      { code: 'CP122', title: 'Principles of Public Relations' },
      { code: 'CP123', title: 'Professional English Writing' },
      { code: 'BA124', title: 'Introduction to Law' },
      { code: 'CP211', title: 'Mass Communication Concepts and Processes' },
      { code: 'CP213', title: 'Online Media Production' },
      { code: 'CP214', title: 'Nature and Theories of Public Relations' },
      { code: 'CP222', title: 'News Writing, Reporting and Editing' },
      { code: 'CP311', title: 'Communication Techniques in Public Relations' },
      { code: 'CP322', title: 'Print Media Production' },
      { code: 'CP411', title: 'Media and Public Relations Management' },
      { code: 'CP423', title: 'Radio and TV Production' },
    ],
  },
];

export function findProgramByKey(programKey: string) {
  return COURSE_CATALOG.find((program) => program.key === programKey) || null;
}

