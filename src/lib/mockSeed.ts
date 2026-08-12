import { Participant } from '../types';

export const INITIAL_PARTICIPANTS: Omit<Participant, 'id'>[] = [
  {
    name: "Ahmad Rizky",
    teamName: "FC Striker Inovasi",
    projectTitle: "Pengurangan Waste Production Line dengan Sensor IoT",
    levelCategory: "Leading",
    stream: "QCC"
  },
  {
    name: "Siti Rahmawati",
    teamName: "Red Dragon Squad",
    projectTitle: "Sistem Otomatisasi Input Quality Assurance Berbasis OCR",
    levelCategory: "Leading",
    stream: "QCC"
  },
  {
    name: "Budi Pratama",
    teamName: "Green Turf Innovators",
    projectTitle: "Optimasi Konsumsi Listrik Motor Pabrik Utama",
    levelCategory: "Rising",
    stream: "QCC"
  },
  {
    name: "Dewi Lestari",
    teamName: "Golden Boot Team",
    projectTitle: "Digitalisasi Form Inspeksi K3 Lapangan Real-time",
    levelCategory: "Rising",
    stream: "QCC"
  },
  {
    name: "Eko Hendro",
    teamName: "United Engineers",
    projectTitle: "Modifikasi Blade Mixer untuk Efisiensi Mixing 25%",
    levelCategory: "SS",
    stream: "SS"
  },
  {
    name: "Fani Kartika",
    teamName: "Young Champions",
    projectTitle: "Aplikasi Mobile Pelaporan Breakdown Mesin Cepat",
    levelCategory: "SS",
    stream: "SS"
  }
];
