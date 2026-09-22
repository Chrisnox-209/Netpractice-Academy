window.COURSES = [
  {
    id: "network",
    icon: "01",
    title: "Un réseau, c'est quoi ?",
    duration: "8 min",
    summary: "Comprendre hôte, switch, routeur et paquet sans jargon inutile.",
    body: `
      <h3>L'idée la plus importante</h3>
      <p>Un réseau permet à des machines de s'envoyer des données. Une machine connectée au réseau est un <strong>hôte</strong> : ordinateur, serveur, téléphone, imprimante…</p>
      <div class="analogy"><strong>Image mentale :</strong> l'adresse IP ressemble à une adresse postale. Le masque indique la taille du quartier. Le routeur est la sortie du quartier vers les autres quartiers.</div>
      <h3>Switch ou routeur ?</h3>
      <p>Un <strong>switch</strong> relie des machines qui se trouvent sur le même réseau local. Il ne sert pas à choisir une route vers un autre réseau IP.</p>
      <p>Un <strong>routeur</strong> possède plusieurs interfaces réseau et sait faire passer un paquet d'un réseau à un autre.</p>
      <h3>La question à se poser</h3>
      <p>Quand A veut parler à B : <em>B est-il dans mon réseau local ?</em> Si oui, A communique localement. Sinon, A envoie le paquet à sa passerelle.</p>
    `
  },
  {
    id: "ipv4",
    icon: "02",
    title: "Lire une adresse IPv4",
    duration: "10 min",
    summary: "Comprendre les 4 nombres, les 32 bits et les adresses spéciales.",
    body: `
      <h3>IPv4 = 32 bits</h3>
      <p>Une IPv4 comme <code>192.168.1.42</code> contient 4 groupes de 8 bits. Chaque groupe peut donc aller de 0 à 255.</p>
      <pre>192       .168       .1         .42
11000000  .10101000  .00000001  .00101010</pre>
      <p>On appelle chaque groupe un <strong>octet</strong>.</p>
      <h3>Une IP seule ne suffit pas</h3>
      <p><code>192.168.1.42</code> ne dit pas où finit la partie « réseau ». Pour cela, il faut connaître le <strong>masque</strong>, par exemple <code>/24</code>.</p>
      <div class="warning"><strong>Piège classique :</strong> deux adresses qui se ressemblent ne sont pas forcément dans le même réseau. Le masque décide.</div>
    `
  },
  {
    id: "mask",
    icon: "03",
    title: "Masques et CIDR",
    duration: "15 min",
    summary: "Comprendre /24, /26, /30 et calculer la taille d'un sous-réseau.",
    body: `
      <h3>Que veut dire /24 ?</h3>
      <p><code>/24</code> signifie que les 24 premiers bits décrivent le réseau. Les 8 bits restants servent aux adresses dans ce réseau.</p>
      <p><code>/24</code> correspond au masque <code>255.255.255.0</code>.</p>
      <table class="learn-table"><thead><tr><th>CIDR</th><th>Masque</th><th>Adresses</th><th>Hôtes usuels</th></tr></thead><tbody>
        <tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
        <tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
        <tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
        <tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
        <tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
        <tr><td>/29</td><td>255.255.255.248</td><td>8</td><td>6</td></tr>
        <tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td></tr>
      </tbody></table>
      <h3>Règle pratique</h3>
      <p>Quand le CIDR augmente de 1, la taille du réseau est divisée par 2. Un /24 contient deux /25 ; un /25 contient deux /26 ; etc.</p>
    `
  },
  {
    id: "subnet",
    icon: "04",
    title: "Adresse réseau et broadcast",
    duration: "15 min",
    summary: "Trouver le début, la fin et les adresses utilisables d'une plage.",
    body: `
      <h3>Exemple : 192.168.1.70/26</h3>
      <p>Un /26 avance par blocs de 64 : 0, 64, 128, 192. L'adresse 70 tombe donc dans le bloc qui commence à 64.</p>
      <pre>Réseau     192.168.1.64
1er hôte   192.168.1.65
Dernier    192.168.1.126
Broadcast  192.168.1.127</pre>
      <p>Dans les exercices classiques, l'adresse réseau et le broadcast ne sont pas attribués à une machine.</p>
      <div class="tip"><strong>Réflexe :</strong> avant de choisir une IP, trouve toujours la plage exacte autorisée.</div>
    `
  },
  {
    id: "same-net",
    icon: "05",
    title: "Même réseau ou pas ?",
    duration: "12 min",
    summary: "Décider si deux machines peuvent communiquer directement.",
    body: `
      <p>Pour savoir si deux IP sont dans le même réseau, on calcule leur <strong>adresse réseau avec le même masque</strong>.</p>
      <pre>192.168.1.70/26  -> réseau 192.168.1.64
192.168.1.100/26 -> réseau 192.168.1.64   ✅ même réseau
192.168.1.130/26 -> réseau 192.168.1.128  ❌ autre réseau</pre>
      <p>Le troisième nombre n'est donc pas toujours « fixe ». Tout dépend du masque.</p>
    `
  },
  {
    id: "overlap",
    icon: "06",
    title: "Chevauchement de sous-réseaux",
    duration: "18 min",
    summary: "Comprendre pourquoi deux réseaux peuvent se marcher dessus et comment l'éviter.",
    body: `
      <h3>Qu'est-ce qu'un chevauchement ?</h3>
      <p>Deux sous-réseaux se chevauchent lorsqu'ils revendiquent au moins une même adresse IP. Pour un routeur, cette situation est ambiguë : une adresse peut sembler appartenir à deux interfaces ou à deux routes différentes.</p>
      <h3>Exemple</h3>
      <pre>Réseau A : 192.168.1.0/25   -> 192.168.1.0   à 192.168.1.127
Réseau B : 192.168.1.64/26  -> 192.168.1.64  à 192.168.1.127</pre>
      <p>Tout le réseau B est déjà à l'intérieur du réseau A : ils se <strong>chevauchent</strong>.</p>
      <h3>Comment l'éviter ?</h3>
      <p>1. Calcule le début et la fin de chaque réseau. 2. Vérifie que les plages ne se croisent jamais. 3. Place le réseau suivant sur une <strong>frontière valide</strong> de son masque.</p>
      <pre>A : 192.168.1.0/25     -> .0   à .127
B : 192.168.1.128/26   -> .128 à .191  ✅</pre>
      <div class="warning"><strong>Attention :</strong> changer seulement l'IP d'un hôte ne corrige pas un mauvais plan d'adressage. Il faut raisonner sur les plages complètes définies par les masques.</div>
    `
  },
  {
    id: "gateway",
    icon: "07",
    title: "Passerelle par défaut",
    duration: "12 min",
    summary: "Comprendre où envoyer un paquet destiné à un autre réseau.",
    body: `
      <p>Si la destination n'est pas locale, la machine remet le paquet à sa <strong>passerelle par défaut</strong>. Cette passerelle doit être l'adresse d'une interface du routeur située dans le même sous-réseau que la machine.</p>
      <pre>PC :       192.168.10.42/24
Routeur :  192.168.10.1/24
Gateway :  192.168.10.1       ✅</pre>
      <p>Mettre comme passerelle une adresse qui n'est pas joignable localement ne peut pas fonctionner : le PC ne saurait même pas comment atteindre sa propre sortie.</p>
    `
  },
  {
    id: "routes",
    icon: "08",
    title: "Tables de routage",
    duration: "18 min",
    summary: "Lire destination, préfixe, next hop et route par défaut.",
    body: `
      <p>Une route répond à la question : <strong>« Pour atteindre ce réseau, à quel voisin dois-je remettre le paquet ? »</strong></p>
      <pre>Destination       Next hop
192.168.20.0/24   10.0.0.2
0.0.0.0/0         203.0.113.1</pre>
      <p><code>0.0.0.0/0</code> signifie « tout ce qui n'a pas de route plus précise ». C'est la route par défaut.</p>
      <div class="tip"><strong>Méthode :</strong> pour chaque destination, suis le paquet routeur par routeur, puis fais le trajet retour. NetPractice demande souvent que les deux sens fonctionnent.</div>
    `
  },
  {
    id: "method",
    icon: "09",
    title: "Méthode de résolution",
    duration: "10 min",
    summary: "Une procédure répétable pour ne plus remplir les cases au hasard.",
    body: `
      <ol class="steps">
        <li><strong>Repère chaque lien</strong> : quelles interfaces sont réellement connectées ?</li>
        <li><strong>Déduis les sous-réseaux</strong> à partir des IP/masques déjà donnés.</li>
        <li><strong>Élimine réseau et broadcast</strong> lorsqu'ils ne sont pas utilisables.</li>
        <li><strong>Vérifie les chevauchements</strong> entre interfaces différentes.</li>
        <li><strong>Place les gateways</strong> : elles doivent être directement joignables.</li>
        <li><strong>Ajoute les routes</strong> vers les réseaux distants.</li>
        <li><strong>Teste l'aller ET le retour</strong>.</li>
      </ol>
      <div class="analogy"><strong>Ne devine pas.</strong> Chaque case de NetPractice peut être déduite d'une contrainte visible dans la topologie.</div>
    `
  }
];
