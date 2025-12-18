import { ResumeData } from './types';

export const RESUME_DATA: ResumeData = {
  name: "Vinay Anand Bhaskarla",
  title: "Mechanical Design Engineer | Georgia Tech Student",
  bio: "Design Engineer with 10+ years in Automotive (BIW, Product Design). Proficient in CAD (Catia/NX) and Python for engineering automation. Currently pursuing a Master's in Computer Science at Georgia Tech.",
  location: "Farmington Hills, MI",
  availability: true,
  // Keep resume link for the "View Full Resume" CTA (works on both / and /preview/ because it's relative)
  resumeUrl: "Vinay_Bhaskarla_Resume.pdf",
  socials: [
    { platform: "GitHub", url: "https://github.com/vinayanand3", iconName: "Github" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/vinayanand2", iconName: "Linkedin" },
    { platform: "Email", url: "mailto:vinayanand2@gmail.com", iconName: "Mail" },
    // This icon now links to your project journey PDF (resume is available via "View Full Resume")
    { platform: "Professional Journey", url: "projects/professional_journey.pdf", iconName: "FileText" }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Nissan Technical Center (Goken America)",
      role: "Design Release Engineer (Materials)",
      period: "Sep 2024 — Present",
      description: "Leading flex sourcing strategies for materials to drive cost savings. Developed Python tools to automate mechanical property and chemistry comparisons between flat steel grades. Working on steel coil width optimization to reduce scrap.",
      technologies: ["NX11", "Catia V5", "Python", "DVPR", "Material Science"],
      projectId: "proj-1"
    },
    {
      id: "exp-2",
      company: "Rivian Automotive",
      role: "Senior Mechanical Design Engineer",
      period: "May 2021 — Sep 2024",
      description: "Engineered BIW structure fasteners, sealers, B-pillars, and bumper beams for RPV and R1T programs. Created strategies for commonizing welds/SPRs and managed PLM data in Enovia. Provided on-site plant support in Normal, IL.",
      technologies: ["Catia V6 (3DX)", "Enovia", "DFM", "GD&T", "Jira"],
      projectId: "proj-2"
    },
    {
      id: "exp-3",
      company: "FCA (TEC Group)",
      role: "Product Engineer",
      period: "Mar 2019 — May 2020",
      description: "Designed steering columns for RAM trucks and cross-car beams for JEEP Wrangler. Optimized upper I-shaft designs using DFSS (Red X, Green Y) to resolve warranty issues and manufacturing constraints.",
      technologies: ["NX11", "Catia V5", "Teamcenter", "DFSS", "Root Cause Analysis"],
      projectId: "proj-3"
    },
    {
      id: "exp-4",
      company: "Ford Motor Company (OPTIMAL CAE)",
      role: "Product Engineer",
      period: "Aug 2015 — Mar 2019",
      description: "Designed B-pillar sheet metal brackets and floor panel reinforcements for Ford F150 (Electric) and Mondeo EU. Performed motion mapping for steering columns using KBE tools.",
      technologies: ["Catia V5", "Teamcenter", "Vismockup", "KBE", "Sheet Metal"],
      projectId: "proj-4"
    },
    {
      id: "exp-6",
      company: "University of Michigan-Dearborn",
      role: "Graduate Research Assistant",
      period: "Jun 2014 — Jun 2015",
      description: "Conducted fatigue analysis of spot welds of automotive BIW using Hypermesh and Abaqus under tensile stress. Designed a rubber shredding machine for extracting rubber from used tires of automobiles using Catia V5.",
      technologies: ["Catia V5", "Hypermesh", "Abaqus", "Fatigue Analysis", "Research"]
    },
    {
      id: "exp-5",
      company: "Hyundai Motor India Engineering",
      role: "Research Engineer",
      period: "Sep 2010 — Dec 2013",
      description: "Designed BIW structure parts (underbody, rear floor, dash panel) for i10/i20 projects. Performed digital pre-assembly checks and reverse engineering from 3D scan data.",
      technologies: ["Catia V5", "Reverse Engineering", "Cost Reduction", "PLM"],
      projectId: "proj-5"
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Georgia Institute of Technology",
      degree: "MS in Computer Science (Artificial Intelligence)",
      period: "2024 — Present"
    },
    {
      id: "edu-2",
      institution: "University of Michigan-Dearborn",
      degree: "MS in Automotive Systems Engineering",
      period: "2014 — 2015"
    },
    {
      id: "edu-3",
      institution: "Jawaharlal Nehru Technological University",
      degree: "B.Tech in Mechanical Engineering",
      period: "2006 — 2010"
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Nissan - Flex Sourcing for Flat Steel",
      description: "Flex sourcing for flat steel and material comparison and automation tools. Created Python-based tools to compare mechanical properties and chemistry of different flat steel grades, aiding in the execution of flex sourcing strategies for cost optimization at Nissan.",
      technologies: ["Python", "Data Analysis", "Automation", "Material Science"],
      details: [
        "Built internal Python utilities to ingest mechanical property and chemistry data for flat steel grades coming from multiple suppliers. The tools normalize units, validate ranges, and highlight outliers so material engineers can trust the inputs before making sourcing decisions.",
        "Modeled side‑by‑side comparisons of candidate steels for a given application, surfacing trade‑offs in yield strength, elongation, and chemistry. This directly supports Nissan's flex‑sourcing strategy, where multiple suppliers can qualify for the same part while still meeting DVPR requirements.",
        "Automated report generation so that engineering, purchasing, and supplier quality can review a single, consistent data pack instead of manually stitching together spreadsheets."
      ],
      link: "https://github.com/vinayanand3",
      image: "/vinay-resume/projects/nissan-flex-sourcing/flex-sourcing.png"
    },
    {
      id: "proj-2",
      title: "Rivian - R1T/R1S/EDV BIW Design",
      description: "Senior Mechanical Design Engineer | Rivian (2021–2024) — Designed and launched BIW subsystems for RPV/EDV vans; owned fastening/sealing strategy, value engineering, and launch issue resolution.",
      technologies: ["CATIA V6 (3DX)", "ENOVIA (PLM)", "Jira", "BIW Design", "GD&T", "Weld/SPR/FDS", "DFM", "Root Cause Analysis", "Material Selection"],
      details: [
        "Designed and launched critical BIW subsystems for the RPV/EDV electric vans, including cargo cooling ventilation, crash sensor brackets, and radar integration features using CATIA V6.",
        "Defined and executed the fastening and sealing strategy (welds, SPRs, sealers) for the entire BIW structure; implemented a fastener commonization roadmap that streamlined assembly and reduced costs.",
        "Led a value-engineering initiative to redesign skateboard midrails from aluminum extrusions to steel tubes, enhancing durability while optimizing material costs.",
        "Resolved high-priority manufacturing issues during launch by identifying and fixing a weld spatter defect on B-pillars that compromised airbag safety on R1T and RPV lines.",
        "Key skills/tools: CATIA V6 (3DX), ENOVIA (PLM), Jira; BIW structure design, GD&T, fastening strategy (Weld/SPR/FDS), DFM, root cause analysis, and material selection (Al → steel)."
      ],
      link: "https://github.com/vinayanand3",
      image: "/vinay-resume/projects/rivian-biw-design/rivian-contributions.png"
    },
    {
      id: "proj-3",
      title: "FCA - Ram 1500/2500 & Jeep Wrangler",
      description: "Ram 1500/2500 and Jeep Wrangler - Steering columns and EA brackets. Resolved I-shaft warranty issues for RAM trucks and designed Energy Absorbing (EA) brackets for cross-car beams.",
      technologies: ["NX11", "Catia V5", "DFSS", "Root Cause Analysis", "Safety Engineering", "Crash Analysis"],
      details: [
        "I-Shaft Warranty Reduction & Design Optimization: Tasked with resolving high warranty returns caused by water intrusion in lower I-shaft bearing seals and assembly failures due to dash panel interference. Led a root cause analysis using Kepner Tregoe (Red X) methodologies to isolate failure modes. Leveraged DFSS Green Belt principles to optimize the upper I-shaft design and re-engineered the lower bearing seals using NX11 and Catia V5. Developed and executed a comprehensive DVPR to validate the new geometry. Successfully implemented design changes that eliminated water intrusion, resolved assembly interference issues, and significantly reduced overall warranty costs.",
        "Jeep Wrangler EA Brackets: Led design of energy‑absorbing (EA) brackets on the Jeep Wrangler cross‑car beam, starting from FD curves and FMVSS targets provided by the safety team. Collaborated closely with CAE to iterate bracket geometry and thickness, translating crash simulation feedback into practical, manufacturable sheet‑metal solutions in NX/Catia. Drove the parts through release, coordinating with suppliers and manufacturing to ensure tooling feasibility and robust performance during physical frontal crash testing."
      ],
      link: "https://github.com/vinayanand3",
      image: "/vinay-resume/projects/fca-steering-ea/ram-1500_1.png"
    },
    {
      id: "proj-4",
      title: "Ford - F150 Lightning, Mondeo, Lincoln MKZ",
      description: "Ford Electrification BIW & Component Design - Designed new Body-in-White (BIW) components to package next-generation EV battery packs and electronics for Ford Mondeo, F150, and HEV lines.",
      technologies: ["Catia V5", "Teamcenter", "KBE", "Motion Mapping", "EV Packaging", "BIW Design", "FEA"],
      details: [
        "Challenge: Tasked with designing new Body-in-White (BIW) components to package next-generation EV battery packs and electronics within existing vehicle platforms for the Ford Mondeo, F150, and HEV lines.",
        "Action: Designed front floor reinforcements using CATIA V5 to accommodate Gen-III air-cooled HV batteries for the Mondeo, collaborating with CAE teams to optimize FEA results. Engineered OBD mounting brackets for the Electric F150 ensuring full compliance with production standards, and designed complex blow-molded HV battery cooling ducts for HEV models.",
        "Result: Delivered production-feasible designs on time, facilitating the integration of critical EV hardware. Recognized with a Ford Recognition Award for the successful design of the complex HV battery cooling ducts."
      ],
      link: "https://github.com/vinayanand3",
      image: "/vinay-resume/projects/ford-steering-components/ford-f150_1.png"
    },
    {
      id: "proj-5",
      title: "Hyundai - I10/I20 BIW Design",
      description: "I10, I20 : BIW design (floor and dash panel), benchmarking. Designed BIW structure parts for Hyundai's compact car platforms.",
      technologies: ["Catia V5", "BIW Design", "Reverse Engineering", "Cost Reduction", "PLM"],
      details: [
        "Designed BIW structure parts including underbody, rear floor, and dash panel for i10 and i20 projects at Hyundai Motor India Engineering.",
        "Performed digital pre-assembly checks and reverse engineering from 3D scan data to support design validation and manufacturing feasibility.",
        "Conducted benchmarking studies and cost reduction initiatives, working with cross-functional teams to optimize designs for production."
      ],
      link: "https://github.com/vinayanand3",
      image: "/vinay-resume/projects/hyundai-biw-design/hyundai-i20_1.png"
    }
  ],
  skills: [
    {
      category: "CAD & PLM",
      items: ["Catia V6 (3DX)", "Catia V5", "NX 11", "Teamcenter", "Enovia", "Vismockup", "GD&T"]
    },
    {
      category: "Software & AI",
      items: ["Python", "Generative AI", "Data Analysis", "Automation Scripting"]
    },
    {
      category: "Engineering",
      items: ["BIW Design", "Sheet Metal", "DFM/DFA", "DFSS", "Root Cause Analysis", "Cost Reduction"]
    }
  ]
};