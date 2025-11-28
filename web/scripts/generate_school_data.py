import csv
import uuid
import random
import json

# School Data: (Name, Nigeria Rank, World Rank, Teaching, Research Env, Research Quality, Industry, Intl Outlook)
schools_data = [
    ("University of Ibadan", 1, "801-1000", 35.5, 29.6, 15.6, 63.5, 22.1, 43.8),
    ("University of Lagos", 1, "801-1000", 35.5, 18.4, 20.1, 66.7, 32.6, 45.6),
    ("Bayero University", 3, "1001-1200", 32.1, 22.5, 11.0, 60.7, 18.0, 49.6),
    ("Covenant University", 3, "1001-1200", 32.1, 21.6, 27.5, 50.8, 55.7, 42.3),
    ("Landmark University", 3, "1001-1200", 32.1, 20.2, 18.4, 61.9, 22.1, 37.2),
    ("Ahmadu Bello University", 6, "1201-1500", 27.3, 24.3, 10.0, 58.9, 20.6, 44.2),
    ("University of Ilorin", 6, "1201-1500", 27.3, 15.5, 12.6, 64.8, 20.2, 42.6),
    ("University of Jos", 6, "1201-1500", 27.3, 15.3, 8.6, 55.9, 18.4, 46.4),
    ("University of Nigeria Nsukka", 6, "1201-1500", 27.3, 32.0, 11.0, 40.3, 20.3, 41.4),
    ("Lagos State University", 11, "1501+", 17.1, 10.5, 30.1, 20.9, 45.5, 0.0), # Assuming 0 for missing data
    ("Federal University of Technology Akure", 11, "1501+", 24.4, 12.2, 40.0, 23.9, 46.6, 0.0)
]

# Program Data: (Name, Base Cutoff)
programs_data = [
    ("Medicine and Surgery", 250),
    ("Pharmacy", 240),
    ("Law", 240),
    ("Nursing", 200),
    ("Computer Engineering", 220),
    ("Mechanical Engineering", 220),
    ("Electrical / Electronics Engineering", 220),
    ("Computer Science", 200),
    ("Accounting", 220),
    ("Business Administration", 220),
    ("Mass Communication", 220),
    ("Economics", 200), # Added common course
    ("Architecture", 200),
    ("Political Science", 200),
    ("Microbiology", 200),
    ("Biochemistry", 200)
]

def generate_csv():
    with open("school_programs.csv", "w", newline="", encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            "school_id", "school_name", "nigeria_rank", "world_rank",
            "teaching_score", "research_env", "research_quality", "industry_score",
            "intl_outlook", "program_id", "program_name", "base_cutoff",
            "quota_total", "quota_merit", "quota_catchment", "quota_elds"
        ])

        for school in schools_data:
            school_name = school[0]
            school_id = str(uuid.uuid4())
            
            # Select random subset of programs for each school (e.g., 8-12 programs)
            school_programs = random.sample(programs_data, k=min(len(programs_data), random.randint(8, 12)))
            
            for prog in school_programs:
                program_name = prog[0]
                base_cutoff = prog[1]
                program_id = str(uuid.uuid4())
                
                # Generate Quotas
                # Total quota between 50 and 500
                total_quota = random.choice([50, 100, 150, 200, 250, 300, 500])
                
                # Standard Quota Split: 45% Merit, 35% Catchment, 20% ELDS (Example variation)
                # Or user specified: 70/20/10. Let's use user example as base but vary slightly or keep fixed.
                # User example: 70% Merit, 20% Catchment, 10% ELDS
                
                q_merit = int(total_quota * 0.70)
                q_catchment = int(total_quota * 0.20)
                q_elds = total_quota - q_merit - q_catchment # Remainder
                
                writer.writerow([
                    school_id, school_name, school[1], school[2],
                    school[3], school[4], school[5], school[6],
                    school[7], program_id, program_name, base_cutoff,
                    total_quota, q_merit, q_catchment, q_elds
                ])

    print("Successfully generated school_programs.csv")

if __name__ == "__main__":
    generate_csv()
