package edu.cit.mando.vetclinic.config;

import edu.cit.mando.vetclinic.entity.Clinic;
import edu.cit.mando.vetclinic.repository.ClinicRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ClinicDataSeeder implements CommandLineRunner {

    private final ClinicRepository clinicRepository;

    public ClinicDataSeeder(ClinicRepository clinicRepository) {
        this.clinicRepository = clinicRepository;
    }

    @Override
    public void run(String... args) {
        clinicRepository.saveAll(List.of(
                clinic(1L, "Animal Kingdom Veterinary Hospital", "Lahug",
                        "📍 38 Gorordo Ave, Cebu City, 6000 Cebu",
                        "(032) 383 7512",
                        "Open",
                        "Mon-Sun 8:00 AM-6:00 PM",
                        "Full-service veterinary hospital in the Lahug area.",
                        List.of("Consultation", "Vaccination", "Diagnostic tests", "Surgery")),
                clinic(2L, "Animal Wellness Veterinary Clinic - Banawa Centrale", "Banawa",
                        "📍 8 R. Duterte St, Banawa, Cebu City, 6000 Cebu",
                        "+63 917 705 7819",
                        "Open",
                        "Mon-Sun 10:00 AM-7:00 PM",
                        "Banawa branch for consultations, vaccinations, and pet care.",
                        List.of("Consultation", "Vaccination", "Wellness checkups", "Pet grooming advice")),
                clinic(3L, "Aycardo Veterinary Center Inc. - Main Branch", "Pardo",
                        "📍 68 J. Alcantara St, Cebu City, 6000 Cebu",
                        "(032) 407 8004",
                        "Open",
                        "Mon-Sat 9:00 AM-12:00 PM, Mon-Sat 1:00 PM-6:00 PM",
                        "Main Aycardo branch in Cebu City.",
                        List.of("Consultation", "Deworming", "Vaccination", "Minor procedures")),
                clinic(4L, "Caminade Animal Hospital", "Mabolo",
                        "📍 M. J. Cuenco Ave, Cebu City, 6000 Cebu",
                        "+63 932 197 6459",
                        "Open",
                        "Mon-Sat 8:00 AM-5:00 PM",
                        "Animal hospital serving the Mabolo and North Reclamation area.",
                        List.of("Consultation", "Laboratory tests", "In-patient care", "Surgery")),
                clinic(5L, "Doc John's Vet Clinic - DJVC Lahug", "Lahug",
                        "📍 935K Salinas Dr, Brgy Lahug, Cebu City, 6000 Cebu",
                        "+63 927 631 4605",
                        "24/7",
                        "Daily 9:00 AM-6:00 PM, with 24/7 emergency services",
                        "Lahug branch with emergency care and extended service windows.",
                        List.of("Consultation", "Emergency care", "Vaccination", "Surgery")),
                clinic(6L, "FC Mabolo Animal Clinic", "Mabolo",
                        "📍 Juan Luna Ave Ext, Cebu City, 6000 Cebu",
                        "(032) 233 2039",
                        "Open",
                        "Clinic hours available on request",
                        "Mabolo clinic listed along Juan Luna Avenue Extension.",
                        List.of("Consultation", "Vaccination", "Basic diagnostics", "Pet care advice")),
                clinic(7L, "Gorre Animal Health Clinic", "Cogon Ramos",
                        "📍 0005 R.R. Landon Street, Cebu City, 6000 Cebu",
                        "(032) 253 1550",
                        "Open",
                        "Mon-Sat 10:00 AM-12:00 PM, Mon-Sat 2:00 PM-5:00 PM, Sun Closed",
                        "Central Cebu City clinic near Cogon Ramos.",
                        List.of("Consultation", "Vaccination", "Treatment plans", "Health monitoring")),
                clinic(8L, "Happy Tails Veterinary Clinic", "Labangon",
                        "📍 Ground Floor, Unit 2 Labangon Town Center, Cebu City, 6000 Cebu",
                        "+63 954 298 4479",
                        "24/7",
                        "24/7",
                        "Labangon-based veterinary clinic in a commercial center with 24-hour service.",
                        List.of("Consultation", "Vaccination", "Pet wellness", "Minor procedures")),
                clinic(9L, "Pet Centre Animal Clinic", "San Nicolas",
                        "📍 6 F. Jaca St, Cebu City, 6000 Cebu",
                        "+63 32 516 0323",
                        "Open",
                        "Mon-Sat 9:00 AM-5:00 PM",
                        "Pet centre with consistent daytime clinic hours.",
                        List.of("Consultation", "Vaccination", "Pet supplies", "Routine treatment")),
                clinic(10L, "The Urban Vets", "Citywide",
                        "📍 Home-service veterinary practice serving Cebu City",
                        "+63 927 480 1284",
                        "Appointment Only",
                        "Mon-Sun 9:00 AM-5:00 PM",
                        "Mobile veterinary service for home consultations across Cebu.",
                        List.of("Home consultation", "Vaccination", "Follow-up care", "Pet wellness visits")),
                clinic(11L, "Vida's Pet Home and Animal Clinic", "Labangon",
                        "📍 320 Katipunan St, Labangon, Cebu City, 6000 Cebu",
                        "+63 923 825 0604",
                        "Limited Hours",
                        "Mon-Sat 9:00 AM-12:00 PM, Mon-Sat 3:00 PM-6:00 PM",
                        "Clinic with a split weekly schedule in Labangon.",
                        List.of("Consultation", "Vaccination", "Deworming", "Basic treatment"))
        ));
    }

    private Clinic clinic(
            Long id,
            String name,
            String area,
            String address,
            String phone,
            String status,
            String schedule,
            String notes,
            List<String> services
    ) {
        Clinic clinic = new Clinic();
        clinic.setId(id);
        clinic.setName(name);
        clinic.setArea(area);
        clinic.setAddress(address);
        clinic.setPhone(phone);
        clinic.setStatus(status);
        clinic.setSchedule(schedule);
        clinic.setNotes(notes);
        clinic.setServices(services);
        return clinic;
    }
}
