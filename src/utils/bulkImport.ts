import { Priority, SubjectColor } from '../types';

export interface BulkChapterData {
  name: string;
  topics: string[];
}

export interface BulkSubjectData {
  name: string;
  examDate: string; // Format: DD-MM-YYYY
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  chapters: BulkChapterData[];
}

export const bulkSubjectsData: BulkSubjectData[] = [
  {
    name: 'Computational Mathematics-I',
    examDate: '17-11-2025',
    priority: 'HIGH',
    chapters: [
      {
        name: 'Linear Algebra Fundamentals',
        topics: ['Matrix Algebra', 'Transformations', 'Echelon Forms', 'Rank of Matrices'],
      },
      {
        name: 'Systems of Linear Equations',
        topics: ['Gauss Elimination Method', 'Jordan Method', 'Jacobi Iterative Method', 'Gauss-Seidel Method'],
      },
      {
        name: 'Eigenvalues and Eigenvectors',
        topics: ['Computing Eigenvalues', 'Computing Eigenvectors', 'Diagonalization', 'Spectral Decomposition'],
      },
      {
        name: 'Vector Spaces',
        topics: ['Linear Independence', 'Spanning Sets', 'Basis and Dimension', 'Orthogonal Vectors', 'Gram-Schmidt Process'],
      },
      {
        name: 'Linear Transformations',
        topics: ['Matrix Representation', 'Kernel and Range', 'Change of Basis'],
      },
      {
        name: 'Differential Equations',
        topics: ['Ordinary Differential Equations', 'Higher Order Differential Equations', 'Solution Methods', 'Initial Value Problems'],
      },
      {
        name: 'Advanced Solution Techniques',
        topics: ['Particular Integrals', 'Complementary Functions', 'Variation of Parameters', 'Parametric Curves'],
      },
      {
        name: 'Numerical Methods - Interpolation',
        topics: ['Newton Forward/Backward Interpolation', 'Gregory Interpolation', 'Lagrange Interpolation', 'Numerical Differentiation', 'Numerical Integration'],
      },
      {
        name: 'Numerical Methods - Root Finding',
        topics: ['Trapezoidal Rule', 'Simpson\'s Rules', 'Bisection Method', 'Regula-Falsi Method', 'Modified Euler Method', 'Runge-Kutta Methods'],
      },
    ],
  },
  {
    name: 'Fundamentals of Electronics/Electrical Engineering',
    examDate: '19-11-2025',
    priority: 'HIGH',
    chapters: [
      {
        name: 'DC Circuit Analysis',
        topics: ['Ohm\'s Law', 'Kirchhoff\'s Laws', 'Circuit Analysis Techniques', 'Superposition Theorem', 'Thevenin\'s Theorem', 'Norton\'s Theorem'],
      },
      {
        name: 'AC Circuits',
        topics: ['Single Phase AC Circuits', 'Three Phase AC Circuits', 'Phasor Diagrams', 'Power in AC Circuits'],
      },
      {
        name: 'Transformers',
        topics: ['Transformer Basics', 'Working Principle', 'Losses in Transformers', 'Efficiency Calculations'],
      },
      {
        name: 'Electrical Machines',
        topics: ['DC Motors and Generators', 'AC Motors', 'Induction Motors', 'Synchronous Machines'],
      },
      {
        name: 'Semiconductor Devices',
        topics: ['Semiconductor Physics', 'Diodes and Applications', 'Transistors (BJT and FET)', 'Transistor Configurations'],
      },
      {
        name: 'Operational Amplifiers and Logic Gates',
        topics: ['Op-Amp Basics', 'Op-Amp Applications', 'Digital Logic Gates', 'Boolean Algebra'],
      },
      {
        name: 'Power Electronics',
        topics: ['Silicon Controlled Rectifier (SCR)', 'Triac and DIAC', 'MOSFETs', 'IGBT (Insulated Gate Bipolar Transistor)', 'Rectifiers and Inverters'],
      },
    ],
  },
  {
    name: 'Applied Physics for Engineers / Applied Chemistry for Engineers',
    examDate: '21-11-2025',
    priority: 'MEDIUM',
    chapters: [
      {
        name: 'Battery Technology',
        topics: ['Battery Fundamentals', 'Li-ion Battery Technology', 'Battery Performance Metrics', 'Charging and Discharging'],
      },
      {
        name: 'Polymer Chemistry',
        topics: ['Polymer Structure', 'Types of Polymers', 'Polymerization Reactions', 'Applications of Polymers'],
      },
      {
        name: 'Electronic Materials',
        topics: ['Semiconductor Materials', 'Conducting Polymers', 'Dielectric Materials', 'Magnetic Materials'],
      },
      {
        name: 'Environmental Chemistry',
        topics: ['E-waste Management', 'Circular Economy Principles', 'Environmental Impact Assessment', 'Sustainable Materials'],
      },
      {
        name: 'Case Studies and Measurement',
        topics: ['Polymer Material Case Studies', 'Electronic Material Case Studies', 'Measurement Techniques', 'Characterization Methods'],
      },
      {
        name: 'Laboratory Experiments',
        topics: ['Li-ion Battery Testing', 'Viscometry Experiments', 'Colorimetry Analysis', 'pH Sensor Calibration'],
      },
    ],
  },
  {
    name: 'Fundamentals of Mechanical Engineering/Smart Buildings',
    examDate: '24-11-2025',
    priority: 'MEDIUM',
    chapters: [
      {
        name: 'Engineering Mechanics',
        topics: ['Force Systems', 'Equilibrium of Forces', 'Friction Analysis', 'Trusses Analysis', 'Beam Analysis', 'Types of Loading'],
      },
      {
        name: 'Smart Building Systems',
        topics: ['HVAC Systems', 'Fire Safety Systems', 'Lighting Control Systems', 'Security and Access Control'],
      },
      {
        name: 'Instrumentation and Sensors',
        topics: ['Sensor Basics', 'Temperature Sensors', 'Pressure Sensors', 'Measurement Techniques'],
      },
      {
        name: 'Sustainable Buildings',
        topics: ['Sustainability Principles', 'Energy Efficiency', 'Green Building Concepts', 'LEED Certification'],
      },
      {
        name: 'Building Information Modelling',
        topics: ['BIM Fundamentals', 'BIM Software Tools', 'Virtual Reality in Construction', 'Augmented Reality Applications'],
      },
      {
        name: 'Stress and Strain Analysis',
        topics: ['Stress Concepts', 'Strain Concepts', 'Poisson\'s Ratio', 'Young\'s Modulus', 'Shear Modulus', 'Application Problems'],
      },
    ],
  },
  {
    name: 'Programming for Problem Solving',
    examDate: '26-11-2025',
    priority: 'HIGH',
    chapters: [
      {
        name: 'C Programming Basics',
        topics: ['Variables and Data Types', 'Operators and Expressions', 'Control Flow Statements (if-else)', 'Loops (for, while, do-while)', 'Switch-case Statements'],
      },
      {
        name: 'Arrays and Strings',
        topics: ['One-dimensional Arrays', 'Multi-dimensional Arrays', 'String Handling', 'String Functions'],
      },
      {
        name: 'Modular Programming',
        topics: ['Functions in C', 'Function Arguments', 'Return Values', 'Recursion Basics', 'Recursive Problem Solving'],
      },
      {
        name: 'Advanced Data Types',
        topics: ['Structures', 'Structure Members', 'Unions', 'Typedef', 'Enumerations'],
      },
      {
        name: 'Pointers',
        topics: ['Pointer Basics', 'Pointer Arithmetic', 'Pointers and Arrays', 'Pointers and Strings', 'Pointers and Functions'],
      },
      {
        name: 'File Handling',
        topics: ['File Operations', 'fopen and fclose', 'fread and fwrite', 'File Pointers', 'Text vs Binary Files'],
      },
      {
        name: 'Dynamic Memory Allocation',
        topics: ['malloc Function', 'calloc Function', 'realloc Function', 'free Function', 'Memory Leaks'],
      },
      {
        name: 'Problem Solving and Debugging',
        topics: ['Problem Analysis', 'Algorithm Design', 'Debugging Techniques', 'Common Errors', 'Best Practices'],
      },
    ],
  },
  {
    name: 'Environmental Studies',
    examDate: '28-11-2025',
    priority: 'LOW',
    chapters: [
      {
        name: 'Introduction to Environmental Studies',
        topics: ['Environment Definition', 'Scope and Importance', 'Multidisciplinary Nature', 'Components of Environment'],
      },
      {
        name: 'Natural Resources',
        topics: ['Renewable Resources', 'Non-renewable Resources', 'Water Resources', 'Forest Resources', 'Mineral Resources', 'Energy Resources'],
      },
      {
        name: 'Ecosystems',
        topics: ['Ecosystem Structure', 'Ecosystem Functions', 'Food Chains and Food Webs', 'Energy Flow', 'Ecological Pyramids'],
      },
      {
        name: 'Biodiversity',
        topics: ['Biodiversity Levels', 'Importance of Biodiversity', 'Threats to Biodiversity', 'Conservation Strategies', 'Hotspots in India'],
      },
      {
        name: 'Environmental Pollution',
        topics: ['Air Pollution', 'Water Pollution', 'Soil Pollution', 'Noise Pollution', 'Control Measures'],
      },
      {
        name: 'Environmental Laws',
        topics: ['Indian Environmental Laws', 'Wildlife Protection Act', 'Forest Conservation Act', 'Water and Air Acts', 'International Agreements'],
      },
      {
        name: 'Disaster Management',
        topics: ['Types of Disasters', 'Disaster Preparedness', 'Response and Recovery', 'Risk Reduction', 'Case Studies'],
      },
      {
        name: 'Case Studies',
        topics: ['State-specific Environmental Issues', 'Ballari Mining Case Study', 'Uttarakhand Forest Fires', 'Urban Environmental Problems', 'Success Stories'],
      },
    ],
  },
];

// Helper function to format dates for the app
export const formatDateForApp = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

// Helper function to map priority string to Priority enum
export const mapPriority = (priority: string): Priority => {
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
      return Priority.Critical;
    case 'HIGH':
      return Priority.High;
    case 'MEDIUM':
      return Priority.Medium;
    case 'LOW':
      return Priority.Low;
    default:
      return Priority.Medium;
  }
};

// Helper function to get a color based on index (rotating colors)
export const getColorForIndex = (index: number): SubjectColor => {
  const colors = [
    SubjectColor.Blue,
    SubjectColor.Green,
    SubjectColor.Purple,
    SubjectColor.Orange,
    SubjectColor.Pink,
    SubjectColor.Indigo,
  ];
  return colors[index % colors.length];
};
