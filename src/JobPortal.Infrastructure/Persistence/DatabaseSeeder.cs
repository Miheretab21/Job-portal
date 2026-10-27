using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        // 1. Roles
        foreach (var roleName in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
            }
        }

        // 2. Admin User
        var adminEmail = "admin@jobportal.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "System",
                LastName = "Administrator",
                Role = UserRole.Admin
            };

            var createResult = await userManager.CreateAsync(adminUser, "Admin@123456");
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, Roles.Admin);
            }
        }

        // 3. Demo Employer User & Company
        var employerEmail = "employer@technova.com";
        var employerUser = await userManager.FindByEmailAsync(employerEmail);
        Company? company = null;

        if (employerUser == null)
        {
            employerUser = new ApplicationUser
            {
                UserName = employerEmail,
                Email = employerEmail,
                EmailConfirmed = true,
                FirstName = "Elena",
                LastName = "Vance",
                Role = UserRole.Employer
            };

            var result = await userManager.CreateAsync(employerUser, "Employer@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(employerUser, Roles.Employer);
            }
        }

        company = await context.Companies.FirstOrDefaultAsync(c => c.EmployerUserId == employerUser.Id);
        if (company == null)
        {
            company = new Company
            {
                EmployerUserId = employerUser.Id,
                Name = "TechNova Solutions",
                Description = "Pioneering next-generation cloud architectures and distributed AI infrastructure.",
                Website = "https://technova.example.com",
                Location = "San Francisco, CA / Remote",
                Industry = "Software & Cloud Services",
                CompanySize = "50-200 employees",
                FoundedYear = 2021,
                IsVerified = true,
                LogoUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80"
            };

            context.Companies.Add(company);
            await context.SaveChangesAsync();
        }

        // 3b. Demo Job Seeker User & Profile
        var seekerEmail = "seeker@example.com";
        var seekerUser = await userManager.FindByEmailAsync(seekerEmail);
        JobSeekerProfile? seekerProfile = null;

        if (seekerUser == null)
        {
            seekerUser = new ApplicationUser
            {
                UserName = seekerEmail,
                Email = seekerEmail,
                EmailConfirmed = true,
                FirstName = "Alex",
                LastName = "Rivera",
                Role = UserRole.JobSeeker
            };

            var sResult = await userManager.CreateAsync(seekerUser, "Seeker@123456");
            if (sResult.Succeeded)
            {
                await userManager.AddToRoleAsync(seekerUser, Roles.JobSeeker);
            }
        }

        seekerProfile = await context.JobSeekerProfiles.FirstOrDefaultAsync(p => p.UserId == seekerUser.Id);
        if (seekerProfile == null)
        {
            seekerProfile = new JobSeekerProfile
            {
                UserId = seekerUser.Id,
                Headline = "Senior Full-Stack Cloud Engineer",
                Summary = "Passionate full-stack developer specializing in .NET 10 microservices, Angular, and cloud databases.",
                Location = "San Francisco, CA",
                ResumeUrl = "https://example.com/resumes/alex-rivera-cv.pdf",
                PhoneNumber = "+1 (555) 234-5678",
                IsOpenToWork = true
            };
            context.JobSeekerProfiles.Add(seekerProfile);
            await context.SaveChangesAsync();
        }

        // 4. Ensure all 11 Ethiopian Market Categories exist
        var requiredCategories = new List<(string Name, string Slug, string Description, string Icon)>
        {
            ("Technology", "technology", "Software engineering, cloud architecture, mobile apps, and UI/UX systems", "code"),
            ("Banking, Finance & Accounting", "banking-finance", "Credit analysis, branch operations, audit, tax, and accounting", "landmark"),
            ("Healthcare", "healthcare", "Clinical care, nursing, pharmacy, laboratory, and hospital administration", "heart-pulse"),
            ("NGO & Development", "ngo-development", "Project management, monitoring & evaluation, community aid, and grants", "globe"),
            ("Education", "education", "Higher education lecturing, primary/secondary teaching, and academic leadership", "graduation-cap"),
            ("Sales, Marketing & Customer Service", "sales-marketing", "Sales execution, brand marketing, public relations, and contact centers", "badge-percent"),
            ("Engineering & Construction", "engineering-construction", "Civil infrastructure, structural design, site supervision, and electrical engineering", "hard-hat"),
            ("Agriculture & Agribusiness", "agriculture-agribusiness", "Agronomy, farm management, coffee exports, and agro-processing", "sprout"),
            ("Hospitality & Tourism", "hospitality-tourism", "Hotel operations, culinary arts, front desk, and travel coordination", "hotel"),
            ("Logistics & Supply Chain", "logistics-supply-chain", "Procurement, warehouse operations, fleet management, and distribution", "truck"),
            ("Admin, HR & Legal", "admin-hr-legal", "Human resources, corporate administration, labor compliance, and legal counsel", "scale")
        };

        foreach (var (cName, slug, desc, icon) in requiredCategories)
        {
            var cat = await context.JobCategories.FirstOrDefaultAsync(c => c.Slug == slug);
            if (cat == null)
            {
                context.JobCategories.Add(new JobCategory { Name = cName, Slug = slug, Description = desc, Icon = icon });
            }
            else
            {
                cat.Name = cName;
                cat.Description = desc;
                cat.Icon = icon;
            }
        }
        await context.SaveChangesAsync();

        // 5. Skills (General & Industry-Specific Ethiopian Market Skills)
        var desiredSkills = new[] 
        { 
            // General & Common
            "Excel", "Amharic", "English", "Customer Service", "Project Management", "Communication", "Leadership", "Data Analysis",
            // Banking & Finance
            "Financial Analysis", "Auditing", "Credit Risk", "IFRS", "Branch Operations", "Peachtree / ERP", "Tax Accounting", "Cash Management",
            // Healthcare
            "Patient Care", "Clinical Diagnostics", "Pharmacology", "Laboratory Testing", "Hospital Administration", "Emergency Triage", "Medical Records",
            // NGO & Development
            "Monitoring & Evaluation (M&E)", "Grant Writing", "Community Outreach", "Field Coordination", "Donor Reporting", "Budgeting",
            // Education
            "Curriculum Design", "Classroom Management", "Lesson Planning", "Pedagogy", "Academic Coordination", "Higher Education",
            // Sales & Marketing
            "Sales Strategy", "Digital Marketing", "Client Relations", "Social Media Management", "Call Center Operations", "Negotiation",
            // Engineering & Construction
            "AutoCAD", "Civil Works", "Site Supervision", "Structural Design", "Cost Estimation", "Electrical Systems",
            // Agriculture
            "Agronomy", "Crop Management", "Coffee Quality Control", "Post-Harvest Management", "Export Documentation",
            // Hospitality
            "Front Office Management", "Culinary Arts", "Hospitality Operations", "Food Safety", "Tourism Logistics",
            // Logistics
            "Procurement", "Fleet Management", "Warehouse Operations", "Inventory Control", "Customs Clearance",
            // HR & Legal
            "Labor Law", "Talent Acquisition", "Payroll Administration", "Employee Relations", "Contract Drafting", "Legal Compliance",
            // Technology
            ".NET 10", "C#", "Angular 22", "TypeScript", "PostgreSQL", "Docker", "Kubernetes", "Go", "Python", 
            "Flutter", "Dart", "Mobile", "Machine Learning", "UI/UX", "Figma", "Cloud", "Architecture", "Kafka", "Envoy"
        };

        foreach (var s in desiredSkills)
        {
            if (!await context.Skills.AnyAsync(sk => sk.Name.ToLower() == s.ToLower()))
            {
                context.Skills.Add(new Skill { Name = s, Category = "General" });
            }
        }
        await context.SaveChangesAsync();

        // 6. Distinct Ethiopian & Global Fictional Companies
        var ethioBank = await GetOrCreateCompanyAsync(context, userManager, "careers@ethioheritagebank.et", "EthioHeritage Bank", "Addis Ababa, Ethiopia (Financial District)", "Banking & Financial Services", "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=160&auto=format&fit=crop&q=80", "Premier commercial banking institution delivering digital banking and SME financing across 180 branches.");
        var selamHospital = await GetOrCreateCompanyAsync(context, userManager, "jobs@selamhospital.et", "Selam Care General Hospital", "Addis Ababa, Ethiopia (Sarbet)", "Healthcare & Clinical Medicine", "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=160&auto=format&fit=crop&q=80", "Accredited multidisciplinary hospital delivering advanced clinical care, diagnostic laboratory excellence, and emergency surgery.");
        var hadiNgo = await GetOrCreateCompanyAsync(context, userManager, "hiring@hadi-ethiopia.org", "Horn Development Initiative (HADI)", "Addis Ababa, Ethiopia (Bole Road)", "International NGO & Development", "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=160&auto=format&fit=crop&q=80", "Non-governmental organization implementing sustainable livelihood, public health resilience, and youth empowerment initiatives.");
        var lalibelaHotel = await GetOrCreateCompanyAsync(context, userManager, "hospitality@lalibelagrand.et", "Lalibela Grand Hotel & Suites", "Addis Ababa, Ethiopia (Kazanchis)", "Hospitality & Tourism", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=160&auto=format&fit=crop&q=80", "Five-star luxury convention and leisure hotel hosting international delegations and diplomatic summits in Addis Ababa.");
        var abayConstruction = await GetOrCreateCompanyAsync(context, userManager, "build@abayconstruction.et", "Abay Infrastructure & Construction", "Addis Ababa, Ethiopia (Mexico Square)", "Civil Engineering & Construction", "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=160&auto=format&fit=crop&q=80", "Grade 1 national general contractor managing transportation highways, commercial high-rises, and infrastructure.");
        var awashAgro = await GetOrCreateCompanyAsync(context, userManager, "export@awashagro.et", "Awash Valley Agro-Exports", "Adama & Addis Ababa, Ethiopia", "Agribusiness & Specialty Coffee", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=160&auto=format&fit=crop&q=80", "Integrated agribusiness cultivating Yirgacheffe and Sidama Arabica coffee cherries and direct agricultural export lines.");
        var addisAcademy = await GetOrCreateCompanyAsync(context, userManager, "hr@addisacademy.et", "Addis Premier Academy", "Addis Ababa, Ethiopia (CMC / Ayat)", "K-12 & Higher Education", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80", "Progressive private international academy fostering bilingual STEM excellence and Cambridge curriculum standards.");
        var habeshaGoods = await GetOrCreateCompanyAsync(context, userManager, "sales@habeshagoods.et", "Habesha Consumer Goods & Trade", "Addis Ababa, Ethiopia (Kality)", "FMCG & Retail Distribution", "https://images.unsplash.com/photo-1553413077-190dd305871c?w=160&auto=format&fit=crop&q=80", "Nationwide fast-moving consumer goods manufacturing and retail supply chain reaching 20,000 retail outlets.");
        var boleAdvisory = await GetOrCreateCompanyAsync(context, userManager, "legal@boleadvisory.et", "Bole Corporate Advisory & Legal", "Addis Ababa, Ethiopia (Bole Medhanialem)", "Corporate Law & HR Advisory", "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=160&auto=format&fit=crop&q=80", "Boutique corporate advisory firm guiding international investors and banking groups on Ethiopian commercial law and HR.");

        // Tech Companies
        var nilewave = await GetOrCreateCompanyAsync(context, userManager, "careers@nilewave.et", "Nilewave", "Addis Ababa, Ethiopia (Bole Atlas)", "FinTech & Core Banking", "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=160&auto=format&fit=crop&q=80", "Ethiopia's leading digital banking and financial engineering platform.");
        var swifmPay = await GetOrCreateCompanyAsync(context, userManager, "talent@swifmpay.com", "Swifm Pay", "Addis Ababa / London", "Payments & Cross-Border Money Movement", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=160&auto=format&fit=crop&q=80", "Real-time cross-border settlements and payment rails across Africa.");
        var tanaHealth = await GetOrCreateCompanyAsync(context, userManager, "hiring@tanahealth.et", "TANA Health", "Addis Ababa, Ethiopia (Sarbet)", "Digital Health & Medical AI", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=160&auto=format&fit=crop&q=80", "Transforming healthcare diagnostics with edge AI models and clinical tele-health.");
        var entotoWorks = await GetOrCreateCompanyAsync(context, userManager, "people@entotoworks.et", "Entoto Works", "Addis Ababa, Ethiopia", "Product Studio & Brand Engineering", "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=160&auto=format&fit=crop&q=80", "Premier East African digital product studio shaping award-winning customer experiences.");
        var lalibelaLabs = await GetOrCreateCompanyAsync(context, userManager, "jobs@lalibelalabs.io", "Lalibela Labs", "Addis Ababa / Remote", "Cloud Native & Distributed Cryptography", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=160&auto=format&fit=crop&q=80", "High-assurance distributed systems research and cloud native security engineering.");
        var ebuyLogistics = await GetOrCreateCompanyAsync(context, userManager, "ops@ebuylogistics.et", "ebuy/Logistics", "Addis Ababa, Ethiopia (Kazanchis)", "Supply Chain & Smart Delivery", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=160&auto=format&fit=crop&q=80", "Pan-African intelligent freight logistics and multi-modal e-commerce distribution.");

        // Category Lookups
        var techCat = await context.JobCategories.FirstOrDefaultAsync(c => c.Slug == "technology") 
                      ?? await context.JobCategories.FirstAsync(c => c.Slug == "software-engineering");
        var bankCat = await context.JobCategories.FirstAsync(c => c.Slug == "banking-finance");
        var healthCat = await context.JobCategories.FirstAsync(c => c.Slug == "healthcare");
        var ngoCat = await context.JobCategories.FirstAsync(c => c.Slug == "ngo-development");
        var eduCat = await context.JobCategories.FirstAsync(c => c.Slug == "education");
        var salesCat = await context.JobCategories.FirstAsync(c => c.Slug == "sales-marketing");
        var engCat = await context.JobCategories.FirstAsync(c => c.Slug == "engineering-construction");
        var agroCat = await context.JobCategories.FirstAsync(c => c.Slug == "agriculture-agribusiness");
        var hospCat = await context.JobCategories.FirstAsync(c => c.Slug == "hospitality-tourism");
        var logCat = await context.JobCategories.FirstAsync(c => c.Slug == "logistics-supply-chain");
        var hrCat = await context.JobCategories.FirstAsync(c => c.Slug == "admin-hr-legal");

        var allSkills = await context.Skills.ToListAsync();

        // 7. Comprehensive 32 Jobs Across All 11 Ethiopian Market Categories
        var jobDefinitions = new List<(Job Job, string[] SkillNames)>
        {
            // === BANKING, FINANCE & ACCOUNTING ===
            (
                new Job
                {
                    CompanyId = ethioBank.Id,
                    CategoryId = bankCat.Id,
                    Title = "Senior Credit Risk Analyst",
                    AmharicTitle = "ከፍተኛ የብድር ስጋት ተንታኝ",
                    Description = "Evaluate corporate and commercial loan portfolios, assess client creditworthiness, design credit risk mitigation models, and ensure compliance with National Bank of Ethiopia (NBE) regulatory directives.",
                    Requirements = "- BA or MSc in Accounting, Finance, Economics, or Banking\n- 5+ years of credit evaluation or risk appraisal experience in commercial banking\n- Strong mastery of financial modeling, balance sheet analytics, and IFRS standards\n- Fluent in Amharic and professional English",
                    Benefits = "- 65,000 - 85,000 ETB / month base salary + annual performance dividend\n- Generous staff mortgage and auto loan subsidy privileges\n- Full private medical insurance for employee and immediate family\n- Convenient central office at Addis Ababa Financial District",
                    Location = "Addis Ababa, Ethiopia (Financial District)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "5+ years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 65000,
                    SalaryMax = 85000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 142,
                    DeadlineUtc = DateTime.UtcNow.AddDays(25)
                },
                new[] { "Financial Analysis", "Credit Risk", "IFRS", "Excel", "Data Analysis" }
            ),
            (
                new Job
                {
                    CompanyId = ethioBank.Id,
                    CategoryId = bankCat.Id,
                    Title = "Branch Operations Officer",
                    AmharicTitle = "የቅርንጫፍ ኦፕሬሽንስ ኦፊሰር",
                    Description = "Supervise daily branch front-office operations, oversee teller transactions and cash vault custody, resolve customer inquiries, and ensure strict anti-money laundering (AML) controls.",
                    Requirements = "- BA in Management, Accounting, Banking, or Business Administration\n- 2 - 4 years branch banking operational experience\n- Solid track record in customer service and cash transaction verification\n- Proficient in core banking systems and bilingual fluency",
                    Benefits = "- 38,000 - 52,000 ETB / month salary + branch incentive bonus\n- Housing allowance support in Hawassa\n- Clear professional promotion path to Assistant Branch Manager\n- Continuous on-the-job management training",
                    Location = "Hawassa, Ethiopia",
                    City = "Hawassa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "2 - 4 years",
                    NumberOfPositions = 3,
                    LanguageRequirements = "Amharic, English & Sidaamu Afoo",
                    SalaryMin = 38000,
                    SalaryMax = 52000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 98,
                    DeadlineUtc = DateTime.UtcNow.AddDays(30)
                },
                new[] { "Branch Operations", "Customer Service", "Cash Management", "Communication", "Peachtree / ERP" }
            ),
            (
                new Job
                {
                    CompanyId = ethioBank.Id,
                    CategoryId = bankCat.Id,
                    Title = "Internal Senior Auditor",
                    AmharicTitle = "ከፍተኛ የውስጥ ኦዲተር",
                    Description = "Execute periodic financial, operational, and IT audits across branch networks. Inspect internal controls, assess credit quality compliance, and present objective findings to the Board Audit Committee.",
                    Requirements = "- BA or Master's in Accounting & Finance; ACCA or CIA certification strongly preferred\n- 4+ years audit experience in banking or Big-4 audit firms in Ethiopia\n- Thorough understanding of Ethiopian tax laws and banking directives\n- Analytical rigor and report-writing proficiency",
                    Benefits = "- 70,000 - 95,000 ETB / month\n- Travel per-diem for regional branch inspections\n- ACCA/CIA continuous professional education coverage\n- Comprehensive health insurance coverage",
                    Location = "Addis Ababa, Ethiopia (Bole)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "4+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 70000,
                    SalaryMax = 95000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 110,
                    DeadlineUtc = DateTime.UtcNow.AddDays(20)
                },
                new[] { "Auditing", "IFRS", "Excel", "Financial Analysis", "Tax Accounting" }
            ),
            (
                new Job
                {
                    CompanyId = ethioBank.Id,
                    CategoryId = bankCat.Id,
                    Title = "Junior General Accountant",
                    AmharicTitle = "ጀማሪ አጠቃላይ ሒሳብ ሹም",
                    Description = "Maintain general ledger accounts, prepare bank reconciliations, process vendor invoices, calculate VAT/withholding taxes, and assist senior finance officers during month-end closes.",
                    Requirements = "- Diploma or BA Degree in Accounting or Finance\n- 0 - 2 years experience (fresh graduates with high academic distinction encouraged)\n- Hands-on knowledge of Peachtree Accounting / ERP and MS Excel\n- Detail-oriented with strong numerical integrity",
                    Benefits = "- 26,000 - 36,000 ETB / month entry salary\n- Structured mentorship program under certified chartered accountants\n- Transport subsidy and subsidized staff lunch\n- Annual performance-based promotion evaluation",
                    Location = "Adama, Ethiopia",
                    City = "Adama",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.EntryLevel,
                    EducationLevel = "Diploma",
                    YearsOfExperience = "0 - 2 years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "Amharic, Afaan Oromoo & English",
                    SalaryMin = 26000,
                    SalaryMax = 36000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 88,
                    DeadlineUtc = DateTime.UtcNow.AddDays(15)
                },
                new[] { "Peachtree / ERP", "Excel", "Tax Accounting", "Financial Analysis" }
            ),

            // === HEALTHCARE ===
            (
                new Job
                {
                    CompanyId = selamHospital.Id,
                    CategoryId = healthCat.Id,
                    Title = "Head Critical Care Nurse (ICU)",
                    AmharicTitle = "ከፍተኛ የፅኑ ሕሙማን ነርስ (ICU)",
                    Description = "Provide intensive specialized clinical care for critical ICU patients, oversee vital signs monitoring, administer medications, support ventilator care, and collaborate with attending physicians.",
                    Requirements = "- BSc Degree in Nursing with active EFDA/MOH professional license\n- 3 - 6 years nursing experience with at least 2 years in adult or pediatric ICU\n- Certified in BLS/ACLS resuscitation protocols\n- Compassionate bedside care and ability to thrive under high-acuity pressure",
                    Benefits = "- 35,000 - 48,000 ETB / month base + duty shift differential allowances\n- Subsidized hospital staff meals and modern scrub uniforms\n- Free outpatient and inpatient healthcare for direct dependents\n- Annual continuous nursing education credits",
                    Location = "Addis Ababa, Ethiopia (Sarbet)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "3 - 6 years",
                    NumberOfPositions = 4,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 35000,
                    SalaryMax = 48000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 126,
                    DeadlineUtc = DateTime.UtcNow.AddDays(22)
                },
                new[] { "Patient Care", "Emergency Triage", "Clinical Diagnostics", "Medical Records", "Communication" }
            ),
            (
                new Job
                {
                    CompanyId = selamHospital.Id,
                    CategoryId = healthCat.Id,
                    Title = "Chief Clinical Pharmacist",
                    AmharicTitle = "ዋና ክሊኒካል ፋርማሲስት",
                    Description = "Lead hospital inpatient and outpatient pharmacy dispensaries, verify prescriptions, monitor potential drug interactions, manage cold-chain pharmaceutical stocks, and advise clinical rounds.",
                    Requirements = "- B.Pharm (Bachelor of Pharmacy) with active practitioner registration\n- 5+ years experience in hospital or institutional clinical pharmacy\n- Deep knowledge of EFDA pharmaceutical regulations and essential drug lists\n- Proven leadership in inventory forecasting and team supervision",
                    Benefits = "- 55,000 - 75,000 ETB / month\n- Monthly executive duty allowance and transport stipend\n- Hospital medical care package\n- Leadership track to Hospital Clinical Services Director",
                    Location = "Addis Ababa, Ethiopia (Sarbet)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "5+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 55000,
                    SalaryMax = 75000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 104,
                    DeadlineUtc = DateTime.UtcNow.AddDays(35)
                },
                new[] { "Pharmacology", "Hospital Administration", "Inventory Control", "Patient Care", "Communication" }
            ),
            (
                new Job
                {
                    CompanyId = selamHospital.Id,
                    CategoryId = healthCat.Id,
                    Title = "Medical Laboratory Technologist",
                    AmharicTitle = "የሕክምና ላብራቶሪ ባለሙያ",
                    Description = "Perform diagnostic pathology, hematology, microbiology, and clinical chemistry tests. Calibrate automated lab instruments, document precise test results, and adhere to ISO 15189 standards.",
                    Requirements = "- BSc or Diploma in Medical Laboratory Technology\n- 1 - 3 years experience in accredited diagnostic laboratories or hospital labs\n- Familiarity with automated hematology and biochemistry analyzers\n- Meticulous precision and strict biohazard safety compliance",
                    Benefits = "- 30,000 - 42,000 ETB / month + risk allowance\n- Duty overtime compensation\n- Housing stipend for Bahir Dar regional branch\n- Comprehensive health insurance",
                    Location = "Bahir Dar, Ethiopia",
                    City = "Bahir Dar",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.EntryLevel,
                    EducationLevel = "Diploma",
                    YearsOfExperience = "1 - 3 years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 30000,
                    SalaryMax = 42000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 92,
                    DeadlineUtc = DateTime.UtcNow.AddDays(28)
                },
                new[] { "Laboratory Testing", "Clinical Diagnostics", "Hospital Administration", "Quality Assurance" }
            ),

            // === NGO & DEVELOPMENT ===
            (
                new Job
                {
                    CompanyId = hadiNgo.Id,
                    CategoryId = ngoCat.Id,
                    Title = "Field Project Coordinator (WASH & Resilience)",
                    AmharicTitle = "የመስክ ፕሮጀክት አስተባባሪ",
                    Description = "Coordinate community water, sanitation, and climate resilience interventions across Eastern Ethiopia. Liaise with woreda administrative bureaus, lead beneficiary mobilization, and ensure timely deliverables.",
                    Requirements = "- BA or Master's in Development Studies, Public Health, Environmental Science, or Social Sciences\n- 4+ years managing donor-funded NGO field projects (USAID, EU, or UN grants)\n- Experience in community participatory planning and stakeholder dialogue\n- Fluency in Amharic, English, and either Afaan Oromoo or Somali",
                    Benefits = "- 75,000 - 110,000 ETB / month (tax-advantaged NGO package)\n- Hardship location field allowance + comprehensive field logistics support\n- International SOS emergency travel and life insurance coverage\n- 25 working days paid annual leave",
                    Location = "Dire Dawa, Ethiopia",
                    City = "Dire Dawa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "4+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic, English & Afaan Oromoo / Somali",
                    SalaryMin = 75000,
                    SalaryMax = 110000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 138,
                    DeadlineUtc = DateTime.UtcNow.AddDays(20)
                },
                new[] { "Project Management", "Field Coordination", "Community Outreach", "Budgeting", "Communication" }
            ),
            (
                new Job
                {
                    CompanyId = hadiNgo.Id,
                    CategoryId = ngoCat.Id,
                    Title = "Monitoring & Evaluation (M&E) Specialist",
                    AmharicTitle = "የክትትልና ግምገማ (M&E) ባለሙያ",
                    Description = "Design logical frameworks, M&E indicator tracking plans, and digital survey tools (KoboToolbox/ODK). Conduct field data verification, quantitative statistical analysis, and author quarterly donor reports.",
                    Requirements = "- Master's Degree in Economics, Statistics, Demography, or M&E\n- 5+ years specializing in M&E for international development programs\n- Expert in statistical software (SPSS, Stata, or R) and advanced Excel\n- Outstanding technical writing ability in English",
                    Benefits = "- 95,000 - 135,000 ETB / month\n- Hybrid work flexibility (Bole headquarters + field travel)\n- Laptop and mobile communication allowance\n- Professional capacity development funding",
                    Location = "Addis Ababa, Ethiopia (Bole)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Master's Degree",
                    YearsOfExperience = "5+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 95000,
                    SalaryMax = 135000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 165,
                    DeadlineUtc = DateTime.UtcNow.AddDays(18)
                },
                new[] { "Monitoring & Evaluation (M&E)", "Data Analysis", "Excel", "Donor Reporting", "Grant Writing" }
            ),
            (
                new Job
                {
                    CompanyId = hadiNgo.Id,
                    CategoryId = ngoCat.Id,
                    Title = "Senior Humanitarian Program Manager",
                    AmharicTitle = "ከፍተኛ የሰብዓዊ ፕሮግራም ሥራ አስኪያጅ",
                    Description = "Direct strategic emergency response and multi-year humanitarian portfolios. Oversee budget allocations exceeding $5M USD, chair consortium partner meetings, and ensure strict compliance with Core Humanitarian Standards.",
                    Requirements = "- Master's Degree in International Relations, Development, or Public Administration\n- 8+ years leadership experience in humanitarian response in the Horn of Africa\n- Proven grant acquisition record with BHA, ECHO, FCDO, and GIZ\n- Exceptional diplomatic and multi-sectoral coordination skills",
                    Benefits = "- Competitive international NGO remuneration scale (Negotiable)\n- Executive family medical coverage and retirement pension scheme\n- Vehicle provision for official duties and annual rest & recuperation (R&R)\n- Global conference sponsorship",
                    Location = "Addis Ababa, Ethiopia (with regional visits)",
                    City = "Addis Ababa",
                    JobType = JobType.Contract,
                    ExperienceLevel = ExperienceLevel.Lead,
                    EducationLevel = "Master's Degree",
                    YearsOfExperience = "8+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = null,
                    SalaryMax = null,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = true,
                    Status = JobStatus.Published,
                    ViewsCount = 178,
                    DeadlineUtc = DateTime.UtcNow.AddDays(40)
                },
                new[] { "Leadership", "Project Management", "Grant Writing", "Donor Reporting", "Budgeting" }
            ),

            // === EDUCATION ===
            (
                new Job
                {
                    CompanyId = addisAcademy.Id,
                    CategoryId = eduCat.Id,
                    Title = "Lecturer in Business Management & Economics",
                    AmharicTitle = "የንግድ ሥራ አመራርና ኢኮኖሚክስ መምህር",
                    Description = "Deliver undergraduate lectures, seminars, and case-study sessions in business strategy and microeconomics. Advise senior capstone theses and participate in academic curriculum peer reviews.",
                    Requirements = "- Master's Degree (MBA or MSc in Economics) with first degree in a related field\n- 3+ years teaching experience at accredited college or university level\n- Published academic papers or practical industry management experience a plus\n- Interactive, learner-centered pedagogical methodology",
                    Benefits = "- 45,000 - 62,000 ETB / month\n- Generous school term vacations and summer academic research sabbatical\n- 75% tuition discount for biological children enrolled at the academy\n- Book purchase and research publication stipend",
                    Location = "Addis Ababa, Ethiopia (CMC)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Master's Degree",
                    YearsOfExperience = "3+ years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "English & Amharic",
                    SalaryMin = 45000,
                    SalaryMax = 62000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 89,
                    DeadlineUtc = DateTime.UtcNow.AddDays(30)
                },
                new[] { "Higher Education", "Curriculum Design", "Lesson Planning", "Pedagogy", "Communication" }
            ),
            (
                new Job
                {
                    CompanyId = addisAcademy.Id,
                    CategoryId = eduCat.Id,
                    Title = "Bilingual Primary School Teacher (Science & Math)",
                    AmharicTitle = "የመጀመሪያ ደረጃ ት/ቤት የሳይንስና ሒሳብ መምህር",
                    Description = "Teach upper primary school students using interactive hands-on STEM experiments. Foster foundational curiosity, grade assignments constructively, and maintain strong parental communication.",
                    Requirements = "- Bachelor of Education (BED) in Natural Sciences, Mathematics, or Elementary Education\n- 2 - 5 years teaching experience in respected private or international schools\n- Passion for child development, classroom discipline, and differentiated learning\n- Native/fluent English and Amharic language capability",
                    Benefits = "- 28,000 - 38,000 ETB / month\n- Complete school calendar holiday schedule\n- Modern teaching aids and digital smartboard classroom facilities\n- Academy healthcare coverage",
                    Location = "Addis Ababa, Ethiopia (Ayat)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "2 - 5 years",
                    NumberOfPositions = 3,
                    LanguageRequirements = "English & Amharic",
                    SalaryMin = 28000,
                    SalaryMax = 38000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 76,
                    DeadlineUtc = DateTime.UtcNow.AddDays(25)
                },
                new[] { "Classroom Management", "Lesson Planning", "Curriculum Design", "Communication" }
            ),

            // === SALES, MARKETING & CUSTOMER SERVICE ===
            (
                new Job
                {
                    CompanyId = habeshaGoods.Id,
                    CategoryId = salesCat.Id,
                    Title = "Key Account Sales Executive (B2B)",
                    AmharicTitle = "የሽያጭ ስራ አስፈፃሚ (B2B)",
                    Description = "Drive corporate distribution accounts, negotiate commercial contracts with major supermarket chains and regional wholesalers, hit sales targets, and expand retail market share.",
                    Requirements = "- BA in Marketing, Business Administration, or Economics\n- 3+ years proven sales achievements in FMCG, retail, or industrial distribution\n- Outstanding client relationship building, persuasive closing, and negotiation skills\n- Valid driving license and willingness to conduct client visits across Addis Ababa",
                    Benefits = "- 40,000 - 60,000 ETB base + uncapped monthly sales commission (earning potential up to 100k+)\n- Dedicated company vehicle fuel and maintenance allowance\n- High-tier smartphone and communication stipend\n- Annual top performer international incentive trip",
                    Location = "Addis Ababa, Ethiopia (Kality)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "3+ years",
                    NumberOfPositions = 4,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 40000,
                    SalaryMax = 60000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 135,
                    DeadlineUtc = DateTime.UtcNow.AddDays(20)
                },
                new[] { "Sales Strategy", "Client Relations", "Negotiation", "Communication", "Excel" }
            ),
            (
                new Job
                {
                    CompanyId = habeshaGoods.Id,
                    CategoryId = salesCat.Id,
                    Title = "Digital Brand Marketing Officer",
                    AmharicTitle = "የዲጂታል ብራንድ ማርኬቲንግ ኦፊሰር",
                    Description = "Develop social media growth campaigns, manage digital brand presence across Telegram, TikTok, and LinkedIn, author creative promotional copy, and monitor marketing conversion analytics.",
                    Requirements = "- BA Degree in Marketing, Communications, Journalism, or Graphic Design\n- 2+ years executing brand marketing campaigns in Ethiopia\n- Proficiency in social media management, content creation, and creative copywriting\n- Bilingual fluency with cultural humor and consumer trends acumen",
                    Benefits = "- 45,000 - 65,000 ETB / month\n- Creative freedom and modern multimedia workstation\n- Flexible hybrid working model (Bole office)\n- Annual marketing seminar budget",
                    Location = "Addis Ababa, Ethiopia (Bole)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "2+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 45000,
                    SalaryMax = 65000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 152,
                    DeadlineUtc = DateTime.UtcNow.AddDays(28)
                },
                new[] { "Digital Marketing", "Social Media Management", "Content Creation", "Communication" }
            ),
            (
                new Job
                {
                    CompanyId = habeshaGoods.Id,
                    CategoryId = salesCat.Id,
                    Title = "Customer Service & Contact Center Agent",
                    AmharicTitle = "የደንበኞች አገልግሎትና ኮል ሴንተር ባለሙያ",
                    Description = "Handle inbound customer inquiries, resolve product and delivery questions, log support tickets via CRM, and uphold five-star caller satisfaction ratings across all shifts.",
                    Requirements = "- Diploma or BA in any field\n- 0 - 2 years customer care or call center experience\n- Pleasant phone voice, active listening, and calm problem-resolution temperament\n- Fluent in Amharic, Afaan Oromoo, and working English",
                    Benefits = "- 22,000 - 30,000 ETB / month + shift bonuses\n- Comprehensive customer service certification training\n- Central transport shuttle drop-off service after evening shifts\n- Fast promotion track to Team Leader",
                    Location = "Addis Ababa, Ethiopia (Mexico)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.EntryLevel,
                    EducationLevel = "Diploma",
                    YearsOfExperience = "0 - 2 years",
                    NumberOfPositions = 6,
                    LanguageRequirements = "Amharic, Afaan Oromoo & English",
                    SalaryMin = 22000,
                    SalaryMax = 30000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 118,
                    DeadlineUtc = DateTime.UtcNow.AddDays(15)
                },
                new[] { "Customer Service", "Call Center Operations", "Communication", "Problem Solving" }
            ),

            // === ENGINEERING & CONSTRUCTION ===
            (
                new Job
                {
                    CompanyId = abayConstruction.Id,
                    CategoryId = engCat.Id,
                    Title = "Senior Civil & Structural Engineer",
                    AmharicTitle = "ከፍተኛ የሲቪልና መዋቅር መሐንዲስ",
                    Description = "Perform structural design analysis for reinforced concrete and steel commercial high-rise projects. Review engineering drawings, verify bill of quantities (BOQ), and ensure building code compliance.",
                    Requirements = "- BSc or MSc in Civil Engineering or Structural Engineering\n- 6+ years experience in structural design and construction management\n- Advanced proficiency in AutoCAD, ETABS, SAP2000, and structural detailing\n- Registered practicing professional engineer with the Ministry of Urban Development",
                    Benefits = "- 80,000 - 120,000 ETB / month\n- Site supervision per-diem and project completion bonuses\n- Company vehicle provision for site visits\n- Comprehensive medical and life insurance",
                    Location = "Addis Ababa, Ethiopia (Mexico Square)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "6+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 80000,
                    SalaryMax = 120000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 145,
                    DeadlineUtc = DateTime.UtcNow.AddDays(30)
                },
                new[] { "AutoCAD", "Civil Works", "Structural Design", "Cost Estimation", "Project Planning" }
            ),
            (
                new Job
                {
                    CompanyId = abayConstruction.Id,
                    CategoryId = engCat.Id,
                    Title = "Resident Site Construction Supervisor",
                    AmharicTitle = "የመስክ ግንባታ ተቆጣጣሪ",
                    Description = "Supervise day-to-day on-site construction works, enforce occupational safety standards, inspect raw materials quality (cement, rebar, aggregates), and coordinate sub-contractor trades.",
                    Requirements = "- Diploma or BSc in Construction Technology Management (COTM) or Civil Engineering\n- 3+ years direct on-site supervisory experience on building construction sites\n- Strong leadership with foreman crews, subcontractors, and safety protocols\n- Solid understanding of engineering blueprints and BOQ measurements",
                    Benefits = "- 50,000 - 70,000 ETB / month\n- Free on-site residential accommodation in Hawassa\n- Safety gear, hardship allowance, and food stipend\n- Bonus on successful milestone handover",
                    Location = "Hawassa, Ethiopia",
                    City = "Hawassa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Diploma",
                    YearsOfExperience = "3+ years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 50000,
                    SalaryMax = 70000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 112,
                    DeadlineUtc = DateTime.UtcNow.AddDays(25)
                },
                new[] { "Site Supervision", "Civil Works", "Quality Inspection", "Safety Compliance", "Project Planning" }
            ),

            // === AGRICULTURE & AGRIBUSINESS ===
            (
                new Job
                {
                    CompanyId = awashAgro.Id,
                    CategoryId = agroCat.Id,
                    Title = "Senior Coffee Agronomist & Field Extension Lead",
                    AmharicTitle = "ከፍተኛ የቡና አግሮኖሚስት",
                    Description = "Direct agronomic extension training across smallholder Arabica coffee outgrower schemes in Sidama. Optimize soil fertility, organic pest management, washing station washing processes, and cherry quality.",
                    Requirements = "- BSc or MSc in Agronomy, Plant Science, or Agricultural Economics\n- 4+ years practical field agronomy experience specializing in Ethiopian coffee cultivation\n- Understanding of organic and fair-trade certification requirements\n- Fluency in Sidaamu Afoo, Amharic, and working English",
                    Benefits = "- 60,000 - 85,000 ETB / month\n- Field vehicle logistics and accommodation stipend in Hawassa/Sidama\n- Annual coffee export harvest performance dividend\n- Medical and life insurance package",
                    Location = "Sidama & Addis Ababa, Ethiopia",
                    City = "Hawassa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "4+ years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "Amharic, Sidaamu Afoo & English",
                    SalaryMin = 60000,
                    SalaryMax = 85000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 95,
                    DeadlineUtc = DateTime.UtcNow.AddDays(35)
                },
                new[] { "Agronomy", "Crop Management", "Coffee Quality Control", "Post-Harvest Management" }
            ),
            (
                new Job
                {
                    CompanyId = awashAgro.Id,
                    CategoryId = agroCat.Id,
                    Title = "Agricultural Export Documentation Specialist",
                    AmharicTitle = "የግብርና ምርቶች ኤክስፖርት ሰነድ ባለሙያ",
                    Description = "Manage international shipping paperwork for specialty coffee and oilseed containers. Prepare bills of lading, phytosanitary certificates, Ethiopian Customs declarations, and ECX trade receipts.",
                    Requirements = "- BA in Logistics, Supply Chain, International Trade, or Business Administration\n- 3+ years experience handling agricultural export documentation in Ethiopia\n- Thorough familiarity with National Bank of Ethiopia (NBE) export directives and Ethiopian Customs Commission systems\n- High attention to detail and accuracy under strict shipping deadlines",
                    Benefits = "- 48,000 - 68,000 ETB / month\n- Annual harvest shipping bonus\n- Subsidized company cafeteria meals\n- Private health insurance for employee",
                    Location = "Addis Ababa, Ethiopia (Kality)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "3+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "English & Amharic",
                    SalaryMin = 48000,
                    SalaryMax = 68000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 108,
                    DeadlineUtc = DateTime.UtcNow.AddDays(22)
                },
                new[] { "Export Documentation", "Customs Clearance", "Supply Chain", "Excel", "Communication" }
            ),

            // === HOSPITALITY & TOURISM ===
            (
                new Job
                {
                    CompanyId = lalibelaHotel.Id,
                    CategoryId = hospCat.Id,
                    Title = "Front Office Supervisor & Guest Relations Lead",
                    AmharicTitle = "የፊት ጠረጴዛና እንግዳ ተቀባይ ተቆጣጣሪ",
                    Description = "Supervise front desk operations, VIP guest arrivals, and concierge services. Champion five-star guest hospitality standards, resolve guest inquiries diplomatically, and manage PMS reservations.",
                    Requirements = "- Diploma or BA in Hotel Management, Tourism, or Hospitality\n- 2 - 4 years experience in four- or five-star international hotels\n- Polished presentation, emotional intelligence, and warm interpersonal grace\n- Flawless English and Amharic; knowledge of French or Arabic is a strong advantage",
                    Benefits = "- 32,000 - 46,000 ETB / month + generous monthly hotel service charge\n- Provided hotel meals during working shifts\n- Tailored hotel uniforms with dry-cleaning allowance\n- Career growth opportunities within international hotel chain",
                    Location = "Addis Ababa, Ethiopia (Kazanchis)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Diploma",
                    YearsOfExperience = "2 - 4 years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "Amharic & Fluent English",
                    SalaryMin = 32000,
                    SalaryMax = 46000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 132,
                    DeadlineUtc = DateTime.UtcNow.AddDays(20)
                },
                new[] { "Front Office Management", "Customer Service", "Hospitality Operations", "Communication" }
            ),
            (
                new Job
                {
                    CompanyId = lalibelaHotel.Id,
                    CategoryId = hospCat.Id,
                    Title = "Executive Sous Chef (Continental & Ethiopian Cuisine)",
                    AmharicTitle = "ከፍተኛ ሱ ሼፍ",
                    Description = "Direct kitchen brigade operations across all-day dining and fine dining banquet outlets. Create innovative fusion menus, enforce HACCP food safety, manage kitchen food costs, and mentor junior cooks.",
                    Requirements = "- Culinary Arts Diploma or international trade apprenticeship\n- 5+ years experience in high-volume luxury hotel kitchens or fine dining restaurants\n- Expertise in both European continental dining and elevated authentic Ethiopian gastronomy\n- Passion for culinary creativity and strict sanitation leadership",
                    Benefits = "- Competitive industry compensation (Negotiable based on culinary portfolio)\n- Service charge share + duty meals\n- Uniforms, medical insurance, and creative culinary freedom\n- Annual performance incentive",
                    Location = "Addis Ababa, Ethiopia (Kazanchis)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Diploma",
                    YearsOfExperience = "5+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = null,
                    SalaryMax = null,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = true,
                    Status = JobStatus.Published,
                    ViewsCount = 160,
                    DeadlineUtc = DateTime.UtcNow.AddDays(30)
                },
                new[] { "Culinary Arts", "Food Safety", "Hospitality Operations", "Inventory Control" }
            ),

            // === LOGISTICS & SUPPLY CHAIN ===
            (
                new Job
                {
                    CompanyId = ebuyLogistics.Id,
                    CategoryId = logCat.Id,
                    Title = "Senior Procurement Officer",
                    AmharicTitle = "ከፍተኛ የግዢ ኦፊሰር",
                    Description = "Manage competitive supplier bidding, negotiate bulk commercial procurement contracts, audit vendor compliance, and optimize corporate spend across fleet and facility logistics.",
                    Requirements = "- BA in Procurement, Supply Chain Management, Logistics, or Business Economics\n- 4+ years of strategic sourcing and commercial purchasing experience\n- Skilled in supplier contract negotiation, tender drafting, and cost reduction modeling\n- High ethical standards and transparency compliance",
                    Benefits = "- 55,000 - 75,000 ETB / month\n- Annual procurement performance dividend\n- Flexible hybrid office setup in Kazanchis\n- Family health insurance coverage",
                    Location = "Addis Ababa, Ethiopia (Kazanchis)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "4+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 55000,
                    SalaryMax = 75000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 124,
                    DeadlineUtc = DateTime.UtcNow.AddDays(25)
                },
                new[] { "Procurement", "Contract Drafting", "Excel", "Inventory Control", "Negotiation" }
            ),
            (
                new Job
                {
                    CompanyId = ebuyLogistics.Id,
                    CategoryId = logCat.Id,
                    Title = "Fleet & Distribution Dispatch Coordinator",
                    AmharicTitle = "የትራንስፖርትና ፍሊት አስተባባሪ",
                    Description = "Schedule delivery truck routes across regional freight corridors, monitor GPS vehicle tracking, supervise routine fleet maintenance schedules, and resolve in-transit delivery bottlenecks.",
                    Requirements = "- Diploma or BSc in Logistics, Automotive Engineering, or Transport Management\n- 2+ years fleet dispatching or distribution logistics experience\n- Analytical approach to route optimization, fuel consumption tracking, and driver safety\n- Fast problem-solving reflexes under active transport deadlines",
                    Benefits = "- 36,000 - 50,000 ETB / month\n- Mobile communication allowance\n- Transport subsidy to Kality Central Distribution Hub\n- Employee health insurance",
                    Location = "Addis Ababa, Ethiopia (Kality)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Diploma",
                    YearsOfExperience = "2+ years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 36000,
                    SalaryMax = 50000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 98,
                    DeadlineUtc = DateTime.UtcNow.AddDays(18)
                },
                new[] { "Fleet Management", "Logistics Operations", "Warehouse Operations", "Problem Solving" }
            ),

            // === ADMIN, HR & LEGAL ===
            (
                new Job
                {
                    CompanyId = boleAdvisory.Id,
                    CategoryId = hrCat.Id,
                    Title = "Senior Human Resources Business Partner (HRBP)",
                    AmharicTitle = "ከፍተኛ የሰው ኃይል ሥራ አስኪያጅ (HRBP)",
                    Description = "Partner with corporate leaders to direct talent acquisition, performance appraisals, employee relations, and training programs while ensuring rigorous compliance with the Ethiopian Labour Proclamation.",
                    Requirements = "- BA or Master's in Human Resource Management, Public Administration, or Business\n- 5+ years of progressive HR management experience\n- Thorough mastery of Ethiopian labour laws, severance, and grievance mechanisms\n- Empathetic leadership and conflict mediation skills",
                    Benefits = "- 70,000 - 95,000 ETB / month\n- Annual corporate bonus\n- Prime location office at Bole Medhanialem\n- Comprehensive health and life insurance plan",
                    Location = "Addis Ababa, Ethiopia (Bole Medhanialem)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "5+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 70000,
                    SalaryMax = 95000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 142,
                    DeadlineUtc = DateTime.UtcNow.AddDays(25)
                },
                new[] { "Labor Law", "Talent Acquisition", "Payroll Administration", "Employee Relations", "Leadership" }
            ),
            (
                new Job
                {
                    CompanyId = boleAdvisory.Id,
                    CategoryId = hrCat.Id,
                    Title = "Corporate Legal Counsel (Commercial Law)",
                    AmharicTitle = "የሕግ አማካሪ (ኮርፖሬት)",
                    Description = "Draft and review cross-border investment contracts, advise multinational clients on commercial and regulatory compliance, review joint-venture agreements, and safeguard client legal interests.",
                    Requirements = "- LL.B or LL.M with active federal advocacy/law practice license\n- 4+ years advising on Ethiopian commercial law, corporate contracts, and investments\n- Impeccable contract drafting skills in both Amharic and English\n- Sound judgment and rigorous attention to legal nuance",
                    Benefits = "- Highly competitive corporate legal compensation (Negotiable)\n- Legal bar association dues coverage and international law seminar sponsorship\n- Discretionary advisory deal bonuses\n- Executive health insurance package",
                    Location = "Addis Ababa, Ethiopia (Bole)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Master's Degree",
                    YearsOfExperience = "4+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = null,
                    SalaryMax = null,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = true,
                    Status = JobStatus.Published,
                    ViewsCount = 158,
                    DeadlineUtc = DateTime.UtcNow.AddDays(30)
                },
                new[] { "Labor Law", "Contract Drafting", "Legal Compliance", "Negotiation", "Communication" }
            ),

            // === TECHNOLOGY (7 CURRENT ROLES PRESERVED) ===
            (
                new Job
                {
                    CompanyId = nilewave.Id,
                    CategoryId = techCat.Id,
                    Title = "Senior Full-Stack Engineer (.NET 10 & Angular)",
                    AmharicTitle = "ከፍተኛ ፉል ስታክ ኢንጂነር (.NET 10 እና Angular)",
                    Description = "Join Nilewave's core engineering team building Ethiopia's next-generation digital payments and high-throughput transaction ledger. You will design real-time services on ASP.NET Core 10 and clean reactive client apps in Angular 22.",
                    Requirements = "- 5+ years building distributed backend services with C# and ASP.NET Core\n- Strong proficiency in modern Angular (Signals, Zoneless)\n- Proven experience with PostgreSQL, EF Core, and query optimization\n- Familiarity with Ethiopian financial regulations and ISO 8583 standards is a plus",
                    Benefits = "- 140,000 - 185,000 ETB / month base salary + annual performance bonus\n- Comprehensive private medical insurance for family\n- Flexible hybrid setup (Bole Atlas headquarters)\n- Professional development and foreign conference travel allowance",
                    Location = "Addis Ababa, Ethiopia (Hybrid)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.SeniorLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "5+ years",
                    NumberOfPositions = 2,
                    LanguageRequirements = "English & Amharic",
                    SalaryMin = 140000,
                    SalaryMax = 185000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 205,
                    DeadlineUtc = DateTime.UtcNow.AddDays(45)
                },
                new[] { ".NET 10", "C#", "Angular 22", "PostgreSQL", "Docker" }
            ),
            (
                new Job
                {
                    CompanyId = swifmPay.Id,
                    CategoryId = techCat.Id,
                    Title = "FinTech Backend Architect (Go & Event-Driven Systems)",
                    AmharicTitle = "ፊንቴክ ባክኤንድ አርክቴክት (Go)",
                    Description = "Architect resilient distributed financial infrastructure powering real-time remittances across East Africa and Europe. Lead event-driven messaging, ledger reconciliation, and disaster recovery.",
                    Requirements = "- 6+ years designing scalable microservices in Go or C#\n- Deep knowledge of Kafka, Redis, and high-concurrency relational databases\n- Strong background in cloud infrastructure and financial fraud mitigation",
                    Benefits = "- $120,000 - $165,000 USD base salary + equity stock options\n- 100% remote work flexibility from anywhere in Ethiopia or worldwide\n- Top-tier Apple MacBook Pro M3 setup + home office allowance",
                    Location = "Addis Ababa / Remote (Global)",
                    City = "Remote",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.Lead,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "6+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "English",
                    SalaryMin = 120000,
                    SalaryMax = 165000,
                    SalaryCurrency = "USD",
                    IsRemote = true,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 184,
                    DeadlineUtc = DateTime.UtcNow.AddDays(35)
                },
                new[] { "Go", "PostgreSQL", "Kubernetes", "Docker", "Cloud" }
            ),
            (
                new Job
                {
                    CompanyId = tanaHealth.Id,
                    CategoryId = techCat.Id,
                    Title = "Machine Learning Platform Engineer",
                    AmharicTitle = "የማሽን ለርኒንግ ፕላትፎርም መሐንዲስ",
                    Description = "Build and deploy low-latency clinical diagnostic models for medical clinics across regional Ethiopia. Optimize model serving, feature stores, and automated data pipelines.",
                    Requirements = "- 3+ years experience with Python, PyTorch/TensorFlow, and ML serving\n- Strong background in containerization (Docker, Kubernetes)\n- Hands-on data engineering with PostgreSQL and vector embeddings",
                    Benefits = "- 160,000 - 210,000 ETB / month\n- Impact-driven mission improving healthcare accessibility across East Africa\n- Modern hardware workstation and hybrid work schedule (Sarbet office)",
                    Location = "Addis Ababa, Ethiopia (Hybrid)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.MidLevel,
                    EducationLevel = "Master's Degree",
                    YearsOfExperience = "3+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "English & Amharic",
                    SalaryMin = 160000,
                    SalaryMax = 210000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 142,
                    DeadlineUtc = DateTime.UtcNow.AddDays(60)
                },
                new[] { "Python", "Machine Learning", "Kubernetes", "Docker", "PostgreSQL" }
            ),
            (
                new Job
                {
                    CompanyId = entotoWorks.Id,
                    CategoryId = techCat.Id,
                    Title = "Lead Product Designer (UI/UX & Design Systems)",
                    AmharicTitle = "የዲዛይን ሲስተምስና UI/UX መሪ",
                    Description = "Shape the visual and interactive personality of high-profile digital products for African tech startups. Lead UX research, component token design systems, and rapid prototyping.",
                    Requirements = "- 4+ years of UI/UX leadership for web & mobile applications\n- Mastery of Figma, auto-layout, interactive prototyping, and tokens\n- Deep empathy for African users and accessibility standards (WCAG AA)",
                    Benefits = "- $95,000 - $130,000 USD annual package\n- Generous equipment stipend and paid vacation policy\n- Creative freedom and exposure to global client brands",
                    Location = "Remote (Ethiopia / Global)",
                    City = "Remote",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.Lead,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "4+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "English & Amharic",
                    SalaryMin = 95000,
                    SalaryMax = 130000,
                    SalaryCurrency = "USD",
                    IsRemote = true,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 196,
                    DeadlineUtc = DateTime.UtcNow.AddDays(30)
                },
                new[] { "Figma", "UI/UX", "Design Systems" }
            ),
            (
                new Job
                {
                    CompanyId = lalibelaLabs.Id,
                    CategoryId = techCat.Id,
                    Title = "Staff Cloud Native Platform Engineer (Kubernetes & Envoy)",
                    AmharicTitle = "የክላውድ ኔቲቭ ፕላትፎርም መሐንዲስ",
                    Description = "Design, harden, and manage zero-trust multi-cluster Kubernetes infrastructure running across multiple cloud regions. Lead ingress, Envoy service meshes, and observability stacks.",
                    Requirements = "- 7+ years in cloud native platform infrastructure and Linux systems\n- Deep expertise in Kubernetes operators, Envoy proxy, and Terraform\n- Proficiency in Go or Rust for systems tooling",
                    Benefits = "- $150,000 - $195,000 USD salary + tech grant\n- Completely asynchronous remote work culture\n- Annual team offsite in international tech hubs",
                    Location = "Remote (Worldwide)",
                    City = "Remote",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.Lead,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "7+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "English",
                    SalaryMin = 150000,
                    SalaryMax = 195000,
                    SalaryCurrency = "USD",
                    IsRemote = true,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 210,
                    DeadlineUtc = DateTime.UtcNow.AddDays(40)
                },
                new[] { "Kubernetes", "Go", "Docker", "Cloud" }
            ),
            (
                new Job
                {
                    CompanyId = ebuyLogistics.Id,
                    CategoryId = techCat.Id,
                    Title = "Junior Mobile Developer (Flutter & Dart)",
                    AmharicTitle = "ጀማሪ የሞባይል ሶፍትዌር አልሚ (Flutter)",
                    Description = "Great entry-level opportunity to build offline-first mobile apps for courier drivers and dispatchers across Addis Ababa under senior mentorship.",
                    Requirements = "- Solid foundation in Dart and Flutter framework\n- Understanding of REST APIs, local SQLite/Hive caching, and geolocation\n- Eagerness to learn clean mobile architecture and responsive UI",
                    Benefits = "- 45,000 - 65,000 ETB / month with rapid promotion track\n- Comprehensive technical mentorship program\n- Modern smartphone device and transport subsidy",
                    Location = "Addis Ababa, Ethiopia (Kazanchis)",
                    City = "Addis Ababa",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.EntryLevel,
                    EducationLevel = "Bachelor's Degree",
                    YearsOfExperience = "0 - 2 years",
                    NumberOfPositions = 3,
                    LanguageRequirements = "Amharic & English",
                    SalaryMin = 45000,
                    SalaryMax = 65000,
                    SalaryCurrency = "ETB",
                    IsRemote = false,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 145,
                    DeadlineUtc = DateTime.UtcNow.AddDays(25)
                },
                new[] { "Flutter", "Dart", "Mobile" }
            ),
            (
                new Job
                {
                    CompanyId = company.Id,
                    CategoryId = techCat.Id,
                    Title = "VP of Engineering & Architecture",
                    AmharicTitle = "የኢንጂነሪንግና አርክቴክቸር ምክትል ፕሬዝዳንት",
                    Description = "Executive technology leadership guiding distributed engineering pods across cloud platform scale, hiring, enterprise security, and architecture governance.",
                    Requirements = "- 10+ years software engineering with 4+ years executive leadership\n- Track record scaling high-concurrency systems to millions of users\n- Strategic vision for enterprise cloud-native engineering",
                    Benefits = "- $210,000 - $260,000 USD base salary + executive equity\n- Full executive suite health and retirement plans\n- Global travel allowance and executive coaching",
                    Location = "San Francisco, CA / Remote",
                    City = "Remote",
                    JobType = JobType.FullTime,
                    ExperienceLevel = ExperienceLevel.Executive,
                    EducationLevel = "Master's Degree",
                    YearsOfExperience = "10+ years",
                    NumberOfPositions = 1,
                    LanguageRequirements = "English",
                    SalaryMin = 210000,
                    SalaryMax = 260000,
                    SalaryCurrency = "USD",
                    IsRemote = true,
                    IsSalaryNegotiable = false,
                    Status = JobStatus.Published,
                    ViewsCount = 230,
                    DeadlineUtc = DateTime.UtcNow.AddDays(75)
                },
                new[] { "Architecture", "Cloud", ".NET 10", "Leadership" }
            )
        };

        // Upsert / update existing jobs in place to preserve foreign keys and candidate application history
        var existingJobs = await context.Jobs.Include(j => j.JobSkills).ToListAsync();
        for (int i = 0; i < jobDefinitions.Count; i++)
        {
            var (newJobData, skillNames) = jobDefinitions[i];
            Job? jobToUpdate = (i < existingJobs.Count) ? existingJobs[i] : null;

            if (jobToUpdate != null)
            {
                jobToUpdate.CompanyId = newJobData.CompanyId;
                jobToUpdate.CategoryId = newJobData.CategoryId;
                jobToUpdate.Title = newJobData.Title;
                jobToUpdate.AmharicTitle = newJobData.AmharicTitle;
                jobToUpdate.Description = newJobData.Description;
                jobToUpdate.Requirements = newJobData.Requirements;
                jobToUpdate.Benefits = newJobData.Benefits;
                jobToUpdate.Location = newJobData.Location;
                jobToUpdate.City = newJobData.City;
                jobToUpdate.JobType = newJobData.JobType;
                jobToUpdate.ExperienceLevel = newJobData.ExperienceLevel;
                jobToUpdate.EducationLevel = newJobData.EducationLevel;
                jobToUpdate.YearsOfExperience = newJobData.YearsOfExperience;
                jobToUpdate.NumberOfPositions = newJobData.NumberOfPositions;
                jobToUpdate.LanguageRequirements = newJobData.LanguageRequirements;
                jobToUpdate.SalaryMin = newJobData.SalaryMin;
                jobToUpdate.SalaryMax = newJobData.SalaryMax;
                jobToUpdate.SalaryCurrency = newJobData.SalaryCurrency;
                jobToUpdate.IsRemote = newJobData.IsRemote;
                jobToUpdate.IsSalaryNegotiable = newJobData.IsSalaryNegotiable;
                jobToUpdate.DeadlineUtc = newJobData.DeadlineUtc;
                jobToUpdate.Status = JobStatus.Published;

                // Update skills
                context.JobSkills.RemoveRange(jobToUpdate.JobSkills);
                foreach (var sName in skillNames)
                {
                    var sk = allSkills.FirstOrDefault(s => s.Name.Equals(sName, StringComparison.OrdinalIgnoreCase));
                    if (sk != null)
                    {
                        jobToUpdate.JobSkills.Add(new JobSkill { JobId = jobToUpdate.Id, SkillId = sk.Id, IsRequired = true });
                    }
                }
            }
            else
            {
                context.Jobs.Add(newJobData);
                await context.SaveChangesAsync();
                foreach (var sName in skillNames)
                {
                    var sk = allSkills.FirstOrDefault(s => s.Name.Equals(sName, StringComparison.OrdinalIgnoreCase));
                    if (sk != null)
                    {
                        context.JobSkills.Add(new JobSkill { JobId = newJobData.Id, SkillId = sk.Id, IsRequired = true });
                    }
                }
            }
        }
        await context.SaveChangesAsync();

        // 8. Seed realistic demo applications and saved jobs for Alex Rivera with varied statuses
        if (seekerProfile != null)
        {
            // Look up jobs for the 6 varied applications across Ethiopian industries
            var selamJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name == "Selam Care General Hospital");
            var techNovaJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name == "TechNova Solutions" || j.Company.Name == "TechNova") 
                              ?? await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.CompanyId == company.Id);
            var bankJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name == "EthioHeritage Bank" && j.Title.Contains("Accountant"))
                          ?? await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name == "EthioHeritage Bank");
            var hadiJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name.Contains("Horn Development"));
            var academyJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name.Contains("Addis Premier Academy"));
            var abayJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name.Contains("Abay Infrastructure"));

            var resumeUrl = seekerProfile.ResumeUrl ?? "https://example.com/resumes/alex-rivera-cv.pdf";

            var targetJobIds = new List<Guid>();

            // 1. Selam Care General Hospital -> INTERVIEW (Next Step scheduled!)
            if (selamJob != null)
            {
                targetJobIds.Add(selamJob.Id);
                await UpsertApplicationAsync(
                    context,
                    selamJob.Id,
                    seekerProfile.Id,
                    resumeUrl,
                    "Experienced in clinical laboratory workflows, diagnostic instrumentation, and biomedical data systems. Excited to support Selam Care Hospital.",
                    ApplicationStatus.Interview,
                    DateTime.UtcNow.AddDays(-10),
                    91, 93, 89,
                    "Extensive biomedical lab management, compliance knowledge, and clinical diagnostic systems experience.",
                    "None critical.",
                    "Advanced to panel clinical interview.",
                    new List<(ApplicationStatus FromStatus, ApplicationStatus ToStatus, string Note, DateTime CreatedAtUtc)>
                    {
                        (ApplicationStatus.Submitted, ApplicationStatus.Submitted, "Application submitted via CareerOrbit candidate portal.", DateTime.UtcNow.AddDays(-10)),
                        (ApplicationStatus.Submitted, ApplicationStatus.InReview, "Credentials verified by Clinical Director & HR Committee.", DateTime.UtcNow.AddDays(-7)),
                        (ApplicationStatus.InReview, ApplicationStatus.Shortlisted, "Top candidate score. Selected for final departmental interview.", DateTime.UtcNow.AddDays(-4)),
                        (ApplicationStatus.Shortlisted, ApplicationStatus.Interview, "Interview: Oct 28, 10:00 AM, Selam Care General Hospital (Bole Campus / HR Dept)", DateTime.UtcNow.AddDays(-1))
                    });
            }

            // 2. TechNova Solutions -> SHORTLISTED
            if (techNovaJob != null)
            {
                targetJobIds.Add(techNovaJob.Id);
                await UpsertApplicationAsync(
                    context,
                    techNovaJob.Id,
                    seekerProfile.Id,
                    resumeUrl,
                    "Extensive experience architecting distributed .NET 10 systems, Postgres microservices, and modern Angular interfaces.",
                    ApplicationStatus.Shortlisted,
                    DateTime.UtcNow.AddDays(-8),
                    95, 98, 93,
                    "World-class distributed systems and reactive frontend architecture.",
                    "None.",
                    "Top 1% candidate for VP Architecture.",
                    new List<(ApplicationStatus FromStatus, ApplicationStatus ToStatus, string Note, DateTime CreatedAtUtc)>
                    {
                        (ApplicationStatus.Submitted, ApplicationStatus.Submitted, "Application submitted via one-click apply.", DateTime.UtcNow.AddDays(-8)),
                        (ApplicationStatus.Submitted, ApplicationStatus.InReview, "Engineering portfolio under evaluation by CTO.", DateTime.UtcNow.AddDays(-5)),
                        (ApplicationStatus.InReview, ApplicationStatus.Shortlisted, "Architecture design verified. Shortlisted for executive round.", DateTime.UtcNow.AddDays(-2))
                    });
            }

            // 3. EthioHeritage Bank -> IN REVIEW
            if (bankJob != null)
            {
                targetJobIds.Add(bankJob.Id);
                await UpsertApplicationAsync(
                    context,
                    bankJob.Id,
                    seekerProfile.Id,
                    resumeUrl,
                    "Strong background in financial reporting, auditing, and ledger integrity.",
                    ApplicationStatus.InReview,
                    DateTime.UtcNow.AddDays(-5),
                    87, 88, 86,
                    "Strong financial analysis and compliance background.",
                    "None critical.",
                    "Proceed with standard review.",
                    new List<(ApplicationStatus FromStatus, ApplicationStatus ToStatus, string Note, DateTime CreatedAtUtc)>
                    {
                        (ApplicationStatus.Submitted, ApplicationStatus.Submitted, "Application registered in banking HR system.", DateTime.UtcNow.AddDays(-5)),
                        (ApplicationStatus.Submitted, ApplicationStatus.InReview, "Under review by Head of Branch Operations.", DateTime.UtcNow.AddDays(-2))
                    });
            }

            // 4. Horn Development Initiative -> HIRED (Offer Extended)
            if (hadiJob != null)
            {
                targetJobIds.Add(hadiJob.Id);
                await UpsertApplicationAsync(
                    context,
                    hadiJob.Id,
                    seekerProfile.Id,
                    resumeUrl,
                    "Committed to community water access and humanitarian infrastructure across Ethiopia.",
                    ApplicationStatus.Hired,
                    DateTime.UtcNow.AddDays(-16),
                    92, 94, 90,
                    "Outstanding NGO program coordination and donor reporting experience.",
                    "None.",
                    "Fast-track offer extended.",
                    new List<(ApplicationStatus FromStatus, ApplicationStatus ToStatus, string Note, DateTime CreatedAtUtc)>
                    {
                        (ApplicationStatus.Submitted, ApplicationStatus.Submitted, "Application submitted.", DateTime.UtcNow.AddDays(-16)),
                        (ApplicationStatus.Submitted, ApplicationStatus.InReview, "Initial screening passed by Country Director.", DateTime.UtcNow.AddDays(-12)),
                        (ApplicationStatus.InReview, ApplicationStatus.Shortlisted, "Candidate shortlisted for panel presentation.", DateTime.UtcNow.AddDays(-9)),
                        (ApplicationStatus.Shortlisted, ApplicationStatus.Interview, "On-site panel interview completed successfully.", DateTime.UtcNow.AddDays(-6)),
                        (ApplicationStatus.Interview, ApplicationStatus.Hired, "Formal employment offer extended! Respond by Oct 30, 2026.", DateTime.UtcNow.AddDays(-2))
                    });
            }

            // 5. Addis Premier Academy -> REJECTED (Full evaluation path with dates)
            if (academyJob != null)
            {
                targetJobIds.Add(academyJob.Id);
                await UpsertApplicationAsync(
                    context,
                    academyJob.Id,
                    seekerProfile.Id,
                    resumeUrl,
                    "Passionate educator dedicated to modern student-centered pedagogy.",
                    ApplicationStatus.Rejected,
                    DateTime.UtcNow.AddDays(-14),
                    78, 80, 76,
                    "Strong communication and pedagogy skills.",
                    "Cambridge Year 4 Accreditation.",
                    "Archive application.",
                    new List<(ApplicationStatus FromStatus, ApplicationStatus ToStatus, string Note, DateTime CreatedAtUtc)>
                    {
                        (ApplicationStatus.Submitted, ApplicationStatus.Submitted, "Application submitted.", DateTime.UtcNow.AddDays(-14)),
                        (ApplicationStatus.Submitted, ApplicationStatus.InReview, "Application under academic committee review.", DateTime.UtcNow.AddDays(-11)),
                        (ApplicationStatus.InReview, ApplicationStatus.Shortlisted, "Shortlisted for classroom demo lesson.", DateTime.UtcNow.AddDays(-8)),
                        (ApplicationStatus.Shortlisted, ApplicationStatus.Interview, "Panel interview conducted with Academic Dean.", DateTime.UtcNow.AddDays(-5)),
                        (ApplicationStatus.Interview, ApplicationStatus.Rejected, "Position filled with applicant having direct Cambridge curriculum credentials.", DateTime.UtcNow.AddDays(-2))
                    });
            }

            // 6. Abay Infrastructure & Construction -> SUBMITTED
            if (abayJob != null)
            {
                targetJobIds.Add(abayJob.Id);
                await UpsertApplicationAsync(
                    context,
                    abayJob.Id,
                    seekerProfile.Id,
                    resumeUrl,
                    "Experienced in site inspections, quality control, and structural verification.",
                    ApplicationStatus.Submitted,
                    DateTime.UtcNow.AddDays(-1),
                    89, 90, 88,
                    "Civil engineering and QA inspections background.",
                    "None critical.",
                    "Queued for recruiter review.",
                    new List<(ApplicationStatus FromStatus, ApplicationStatus ToStatus, string Note, DateTime CreatedAtUtc)>
                    {
                        (ApplicationStatus.Submitted, ApplicationStatus.Submitted, "Application received and queued for recruiter review.", DateTime.UtcNow.AddDays(-1))
                    });
            }

            // Soft-delete any leftover application that is not in our 6 targeted applications
            var leftoverApps = await context.JobApplications
                .Where(a => a.JobSeekerProfileId == seekerProfile.Id && !targetJobIds.Contains(a.JobId))
                .ToListAsync();
            foreach (var leftover in leftoverApps)
            {
                leftover.IsDeleted = true;
                leftover.DeletedAtUtc = DateTime.UtcNow;
            }
            if (leftoverApps.Count > 0)
            {
                await context.SaveChangesAsync();
            }

            // Seed/sync saved jobs across a diverse mix of companies
            var existingSaved = await context.SavedJobs.Where(s => s.JobSeekerProfileId == seekerProfile.Id).ToListAsync();
            context.SavedJobs.RemoveRange(existingSaved);
            await context.SaveChangesAsync();

            // Diverse companies: Hotel (urgent deadline), Agro, Bank (already applied to!), Nilewave Tech
            var lalibelaJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name.Contains("Lalibela"));
            var awashJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name.Contains("Awash"));
            var appliedJob = bankJob ?? await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name.Contains("EthioHeritage"));
            var nileJob = await context.Jobs.Include(j => j.Company).FirstOrDefaultAsync(j => j.Company.Name.Contains("Nilewave"));

            if (lalibelaJob != null)
            {
                // Ensure deadline is within 4 days to highlight deadline urgency (< 7 days)
                lalibelaJob.DeadlineUtc = DateTime.UtcNow.AddDays(4);
                context.SavedJobs.Add(new SavedJob { JobSeekerProfileId = seekerProfile.Id, JobId = lalibelaJob.Id, SavedAtUtc = DateTime.UtcNow.AddDays(-2) });
            }
            if (awashJob != null)
            {
                awashJob.DeadlineUtc = DateTime.UtcNow.AddDays(14);
                context.SavedJobs.Add(new SavedJob { JobSeekerProfileId = seekerProfile.Id, JobId = awashJob.Id, SavedAtUtc = DateTime.UtcNow.AddDays(-3) });
            }
            if (appliedJob != null)
            {
                appliedJob.DeadlineUtc = DateTime.UtcNow.AddDays(18);
                context.SavedJobs.Add(new SavedJob { JobSeekerProfileId = seekerProfile.Id, JobId = appliedJob.Id, SavedAtUtc = DateTime.UtcNow.AddDays(-4) });
            }
            if (nileJob != null)
            {
                nileJob.DeadlineUtc = DateTime.UtcNow.AddDays(25);
                context.SavedJobs.Add(new SavedJob { JobSeekerProfileId = seekerProfile.Id, JobId = nileJob.Id, SavedAtUtc = DateTime.UtcNow.AddDays(-1) });
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task<JobApplication> UpsertApplicationAsync(
        ApplicationDbContext context,
        Guid jobId,
        Guid seekerProfileId,
        string resumeUrl,
        string coverLetter,
        ApplicationStatus status,
        DateTime appliedAtUtc,
        int aiMatchScore,
        int aiSkillsScore,
        int aiExperienceScore,
        string aiStrengths,
        string aiMissingSkills,
        string aiRecommendation,
        List<(ApplicationStatus FromStatus, ApplicationStatus ToStatus, string Note, DateTime CreatedAtUtc)> histories)
    {
        var app = await context.JobApplications
            .IgnoreQueryFilters()
            .Include(a => a.StatusHistories)
            .FirstOrDefaultAsync(a => a.JobId == jobId && a.JobSeekerProfileId == seekerProfileId);

        if (app == null)
        {
            app = new JobApplication
            {
                JobId = jobId,
                JobSeekerProfileId = seekerProfileId,
                ResumeUrl = resumeUrl,
                CoverLetter = coverLetter,
                Status = status,
                AppliedAtUtc = appliedAtUtc,
                AiMatchScore = aiMatchScore,
                AiSkillsScore = aiSkillsScore,
                AiExperienceScore = aiExperienceScore,
                AiStrengths = aiStrengths,
                AiMissingSkills = aiMissingSkills,
                AiRecommendation = aiRecommendation,
                AiScoredAtUtc = appliedAtUtc,
                IsDeleted = false
            };
            context.JobApplications.Add(app);
            await context.SaveChangesAsync();
        }
        else
        {
            app.IsDeleted = false;
            app.DeletedAtUtc = null;
            app.DeletedBy = null;
            app.ResumeUrl = resumeUrl;
            app.CoverLetter = coverLetter;
            app.Status = status;
            app.AppliedAtUtc = appliedAtUtc;
            app.AiMatchScore = aiMatchScore;
            app.AiSkillsScore = aiSkillsScore;
            app.AiExperienceScore = aiExperienceScore;
            app.AiStrengths = aiStrengths;
            app.AiMissingSkills = aiMissingSkills;
            app.AiRecommendation = aiRecommendation;
            app.AiScoredAtUtc = appliedAtUtc;

            // Clear old histories to avoid duplicate/stale history records
            context.ApplicationStatusHistories.RemoveRange(app.StatusHistories);
            await context.SaveChangesAsync();
        }

        foreach (var h in histories)
        {
            context.ApplicationStatusHistories.Add(new ApplicationStatusHistory
            {
                JobApplicationId = app.Id,
                FromStatus = h.FromStatus,
                ToStatus = h.ToStatus,
                Note = h.Note,
                CreatedAtUtc = h.CreatedAtUtc
            });
        }
        await context.SaveChangesAsync();
        return app;
    }

    private static async Task<Company> GetOrCreateCompanyAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        string email,
        string name,
        string location,
        string industry,
        string logoUrl,
        string description)
    {
        var existing = await context.Companies.FirstOrDefaultAsync(c => c.Name == name);
        if (existing != null)
        {
            if (existing.LogoUrl != logoUrl)
            {
                existing.LogoUrl = logoUrl;
                await context.SaveChangesAsync();
            }
            return existing;
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = name.Split(' ')[0],
                LastName = "Team",
                Role = UserRole.Employer
            };
            var createRes = await userManager.CreateAsync(user, "Employer@123456");
            if (createRes.Succeeded)
            {
                await userManager.AddToRoleAsync(user, Roles.Employer);
            }
        }

        var comp = new Company
        {
            EmployerUserId = user.Id,
            Name = name,
            Description = description,
            Website = $"https://{name.ToLower().Replace(" ", "").Replace("/", "").Replace("&", "").Replace("(", "").Replace(")", "")}.example.com",
            Location = location,
            Industry = industry,
            CompanySize = "50-250 employees",
            FoundedYear = 2022,
            IsVerified = true,
            LogoUrl = logoUrl
        };
        context.Companies.Add(comp);
        await context.SaveChangesAsync();
        return comp;
    }
}
