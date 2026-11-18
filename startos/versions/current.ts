import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:0',
  releaseNotes: {
    en_US:
      'First alpha for StartOS. Runs the whole Monetary Node — embedded Bitcoin Core, Tor, the stripper, an address index and a dashboard — in one package. Read the warnings before installing: this is unreviewed alpha software, it needs roughly 2 TB of fast storage, and the first run takes days.',
    es_ES:
      'Primera versión alfa para StartOS. Ejecuta todo el Monetary Node — Bitcoin Core integrado, Tor, el recortador, un índice de direcciones y un panel — en un solo paquete. Lee las advertencias antes de instalar: es software alfa sin revisar, necesita alrededor de 2 TB de almacenamiento rápido y la primera ejecución tarda días.',
    de_DE:
      'Erste Alpha für StartOS. Führt den gesamten Monetary Node — eingebettetes Bitcoin Core, Tor, den Stripper, einen Adressindex und ein Dashboard — in einem Paket aus. Lies vor der Installation die Warnungen: Dies ist ungeprüfte Alpha-Software, sie benötigt rund 2 TB schnellen Speicher, und der erste Lauf dauert Tage.',
    pl_PL:
      'Pierwsza wersja alfa dla StartOS. Uruchamia cały Monetary Node — wbudowane Bitcoin Core, Tor, stripper, indeks adresów i panel — w jednym pakiecie. Przeczytaj ostrzeżenia przed instalacją: to nierecenzowane oprogramowanie alfa, wymaga około 2 TB szybkiego magazynu, a pierwsze uruchomienie trwa kilka dni.',
    fr_FR:
      'Première alpha pour StartOS. Exécute tout le Monetary Node — Bitcoin Core intégré, Tor, le découpeur, un index d’adresses et un tableau de bord — dans un seul paquet. Lisez les avertissements avant d’installer : c’est un logiciel alpha non revu, il faut environ 2 To de stockage rapide et la première exécution prend des jours.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
