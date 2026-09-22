(function () {
  "use strict";
  var N = window.NetUtils;

  function val(values, key) { return String(values[key] || "").trim(); }
  function ok(text) { return { ok: true, expected: true, text: text }; }
  function warn(text) { return { ok: true, expected: false, warning: true, text: text }; }
  function no(text) { return { ok: false, expected: false, text: text }; }
  function safe(checks, fn, errorText) {
    try { checks.push(fn()); } catch (e) { checks.push(no(errorText + " — " + e.message)); }
  }
  function result(checks) {
    var valid = checks.length > 0 && checks.every(function (c) { return c.ok; });
    var expected = valid && checks.every(function (c) { return c.expected !== false; });
    return { ok: valid, expected: expected, checks: checks };
  }
  function same(a, b) { return a === b; }

  window.LEVELS = [
    {
      id: 1,
      title: "Deux machines sur le même LAN",
      difficulty: "Débutant",
      goal: "Donner une adresse valide à PC-B pour qu'il soit dans le même /24 que PC-A.",
      concepts: ["IP", "/24", "même réseau"],
      story: "PC-A et PC-B sont branchés sur le même switch. Il n'y a aucun routeur : ils doivent donc appartenir au même sous-réseau.",
      nodes: [
        { id: "a", type: "pc", x: 12, y: 38, label: "PC-A", detail: "192.168.10.20/24" },
        { id: "s", type: "switch", x: 45, y: 38, label: "Switch", detail: "réseau local" },
        { id: "b", type: "pc", x: 78, y: 38, label: "PC-B", detail: "à configurer" }
      ],
      links: [["a","s"],["s","b"]],
      fields: [
        { key: "b_ip", label: "IP de PC-B", placeholder: "ex. 192.168.10.50", type: "ip", help: "Choisis une adresse hôte du réseau 192.168.10.0/24." },
        { key: "b_prefix", label: "Masque de PC-B", placeholder: "/24", type: "cidr", help: "Même lien local = même découpage réseau." }
      ],
      hints: [
        "Commence par calculer le réseau de PC-A. Avec /24, les 3 premiers octets représentent le réseau.",
        "PC-A est dans 192.168.10.0/24. Les hôtes usuels vont de 192.168.10.1 à 192.168.10.254.",
        "Choisis par exemple 192.168.10.50/24. N'utilise ni .0 (réseau), ni .255 (broadcast), ni l'adresse déjà prise .20."
      ],
      solution: "Une solution possible est PC-B = 192.168.10.50/24. 192.168.10.20 et 192.168.10.50 donnent toutes les deux l'adresse réseau 192.168.10.0 avec un /24.",
      validate: function (v) {
        var c = [];
        safe(c, function () { return same(N.parsePrefix(val(v,"b_prefix")),24) ? ok("Le masque /24 est correct.") : no("Le masque doit rester /24 sur ce LAN."); }, "Masque invalide");
        safe(c, function () {
          var ip = val(v,"b_ip");
          if (!N.sameSubnet("192.168.10.20", ip, 24)) return no("PC-B n'est pas dans 192.168.10.0/24.");
          if (!N.isUsableHost(ip,24)) return no("Cette IP est l'adresse réseau ou broadcast.");
          if (ip === "192.168.10.20") return no("Cette IP est déjà utilisée par PC-A.");
          return ok("PC-B possède une adresse hôte libre du bon réseau.");
        }, "IP invalide");
        return result(c);
      }
    },
    {
      id: 2,
      title: "Trouver le bon masque",
      difficulty: "Débutant",
      goal: "Trouver le préfixe commun permettant aux deux machines d'être dans le même petit réseau.",
      concepts: ["CIDR", "blocs", "/26"],
      story: "Les deux IP sont imposées. Tu dois trouver le masque demandé par l'administrateur : le plus petit réseau classique qui contient les deux hôtes.",
      nodes: [
        { id: "a", type: "pc", x: 15, y: 38, label: "PC-A", detail: "10.0.0.65" },
        { id: "s", type: "switch", x: 45, y: 38, label: "Switch", detail: "même LAN" },
        { id: "b", type: "pc", x: 75, y: 38, label: "PC-B", detail: "10.0.0.126" }
      ],
      links: [["a","s"],["s","b"]],
      fields: [
        { key: "prefix", label: "Préfixe des deux machines", placeholder: "/??", type: "cidr", help: "Cherche les frontières de blocs : /25=128 adresses, /26=64, /27=32…" }
      ],
      hints: [
        "Regarde dans quel bloc tombent 65 et 126. Le bloc doit commencer avant 65 et finir après 126.",
        "Avec /26, les blocs du dernier octet sont 0–63, 64–127, 128–191 et 192–255.",
        "65 et 126 sont tous les deux dans 64–127 : le réseau est 10.0.0.64/26. Un /27 les séparerait."
      ],
      solution: "Réponse : /26 (255.255.255.192). La plage est 10.0.0.64–10.0.0.127 ; les hôtes usuels sont .65 à .126.",
      validate: function (v) {
        var c=[];
        safe(c,function(){
          var p=N.parsePrefix(val(v,"prefix"));
          if(!N.sameSubnet("10.0.0.65","10.0.0.126",p)) return no("Avec ce masque, les deux machines ne sont pas dans le même sous-réseau.");
          if(!N.isUsableHost("10.0.0.65",p) || !N.isUsableHost("10.0.0.126",p)) return no("Une des deux IP devient une adresse réseau ou broadcast avec ce masque.");
          if(p===26) return ok("/26 fonctionne et c'est la réponse attendue : le plus petit réseau classique qui contient les deux hôtes.");
          return warn("/"+p+" fonctionne : les deux machines peuvent communiquer. Mais ce n'est pas la réponse attendue : /26 est plus précis et évite de réserver inutilement des adresses.");
        },"Préfixe invalide");
        return result(c);
      }
    },
    {
      id: 3,
      title: "Trois hôtes derrière un switch",
      difficulty: "Débutant",
      goal: "Compléter deux IP dans un LAN /27 sans collision.",
      concepts: ["switch", "/27", "plage hôte"],
      story: "PC-A fixe la plage. PC-B et le serveur doivent rester dans ce même réseau local et recevoir deux adresses différentes.",
      nodes: [
        { id:"a",type:"pc",x:10,y:20,label:"PC-A",detail:"172.16.4.33/27" },
        { id:"s",type:"switch",x:45,y:40,label:"Switch",detail:"LAN /27" },
        { id:"b",type:"pc",x:80,y:20,label:"PC-B",detail:"à configurer" },
        { id:"c",type:"server",x:80,y:62,label:"Serveur",detail:"à configurer" }
      ],
      links:[["a","s"],["s","b"],["s","c"]],
      fields:[
        {key:"b_ip",label:"IP de PC-B",placeholder:"172.16.4.x",type:"ip",help:"PC-A .33/27 détermine le réseau."},
        {key:"c_ip",label:"IP du serveur",placeholder:"172.16.4.x",type:"ip",help:"Même plage, adresse différente."}
      ],
      hints:[
        "Un /27 avance par blocs de 32 : 0, 32, 64, 96…",
        "172.16.4.33/27 appartient au réseau 172.16.4.32/27. Broadcast : .63. Hôtes : .33 à .62.",
        "Choisis deux adresses libres entre .34 et .62, par exemple .40 et .50."
      ],
      solution:"Exemple : PC-B 172.16.4.40/27 et serveur 172.16.4.50/27. Toute paire distincte d'hôtes libres entre .34 et .62 est acceptée.",
      validate:function(v){
        var c=[];
        ["b_ip","c_ip"].forEach(function(k){safe(c,function(){var ip=val(v,k);if(!N.sameSubnet("172.16.4.33",ip,27))return no(k+" n'est pas dans 172.16.4.32/27.");if(!N.isUsableHost(ip,27))return no(k+" n'est pas une adresse hôte utilisable.");if(ip==="172.16.4.33")return no(k+" reprend l'adresse de PC-A.");return ok(k+" est dans la bonne plage.");},"IP invalide");});
        if(val(v,"b_ip") && val(v,"b_ip")===val(v,"c_ip")) c.push(no("PC-B et le serveur ne peuvent pas avoir la même IP."));
        return result(c);
      }
    },
    {
      id: 4,
      title: "Passer d'un LAN à l'autre",
      difficulty: "Intermédiaire",
      goal: "Configurer les passerelles de deux hôtes séparés par un routeur.",
      concepts: ["routeur", "gateway", "deux LAN"],
      story: "Les deux PC sont dans des réseaux différents. Chacun doit envoyer le trafic distant à l'interface locale du routeur.",
      nodes:[
        {id:"a",type:"pc",x:5,y:40,label:"PC-A",detail:"192.168.1.42/24"},
        {id:"r",type:"router",x:45,y:40,label:"Routeur",detail:".1.1 ↔ .2.1"},
        {id:"b",type:"pc",x:82,y:40,label:"PC-B",detail:"192.168.2.99/24"}
      ],
      links:[["a","r"],["r","b"]],
      fields:[
        {key:"gw_a",label:"Gateway de PC-A",placeholder:"192.168.1.x",type:"ip",help:"Doit être une interface du routeur directement joignable depuis PC-A."},
        {key:"gw_b",label:"Gateway de PC-B",placeholder:"192.168.2.x",type:"ip",help:"Même logique du côté droit."}
      ],
      hints:[
        "Une passerelle doit être dans le même réseau local que l'hôte qui l'utilise.",
        "Le routeur possède 192.168.1.1/24 côté PC-A et 192.168.2.1/24 côté PC-B.",
        "PC-A utilise 192.168.1.1 ; PC-B utilise 192.168.2.1."
      ],
      solution:"Gateway PC-A = 192.168.1.1 ; gateway PC-B = 192.168.2.1. Le routeur est directement connecté aux deux réseaux, donc il sait ensuite transférer les paquets.",
      validate:function(v){var c=[];c.push(same(val(v,"gw_a"),"192.168.1.1")?ok("Gateway de PC-A correcte."):no("PC-A doit utiliser l'interface 192.168.1.1 du routeur."));c.push(same(val(v,"gw_b"),"192.168.2.1")?ok("Gateway de PC-B correcte."):no("PC-B doit utiliser l'interface 192.168.2.1 du routeur."));return result(c);}
    },
    {
      id: 5,
      title: "La route par défaut",
      difficulty: "Intermédiaire",
      goal: "Configurer la sortie d'un hôte vers des réseaux inconnus.",
      concepts: ["0.0.0.0/0", "gateway", "route par défaut"],
      story: "Le PC connaît seulement son LAN. Tout ce qui n'est pas local doit partir vers le routeur.",
      nodes:[
        {id:"a",type:"pc",x:10,y:40,label:"Client",detail:"10.10.5.42/24"},
        {id:"r",type:"router",x:48,y:40,label:"Routeur",detail:"10.10.5.1/24"},
        {id:"n",type:"cloud",x:82,y:40,label:"Réseaux distants",detail:"destination inconnue"}
      ],
      links:[["a","r"],["r","n"]],
      fields:[
        {key:"dest",label:"Destination par défaut",placeholder:"0.0.0.0/0",type:"text",help:"La route qui signifie « tout le reste »."},
        {key:"gw",label:"Passerelle du client",placeholder:"10.10.5.x",type:"ip",help:"Voisin routeur dans le LAN du client."}
      ],
      hints:[
        "Une route par défaut représente toutes les destinations non couvertes par une route plus précise.",
        "En IPv4, elle s'écrit 0.0.0.0/0. Le next hop du client doit être local.",
        "Destination = 0.0.0.0/0 ; gateway = 10.10.5.1."
      ],
      solution:"0.0.0.0/0 via 10.10.5.1. /0 ne fixe aucun bit réseau : cette route peut donc correspondre à n'importe quelle destination.",
      validate:function(v){var c=[];c.push(val(v,"dest").replace(/\s/g,"")==="0.0.0.0/0"?ok("La destination par défaut est correcte."):no("La destination par défaut s'écrit 0.0.0.0/0."));c.push(val(v,"gw")==="10.10.5.1"?ok("Le next hop est le routeur local."):no("La gateway doit être 10.10.5.1."));return result(c);}
    },
    {
      id: 6,
      title: "Sortir vers Internet",
      difficulty: "Intermédiaire",
      goal: "Compléter la route par défaut d'un routeur relié à un FAI.",
      concepts: ["WAN /30", "next hop", "Internet"],
      story: "Le routeur connaît son LAN et son lien WAN. Pour toutes les autres destinations, il doit transmettre au routeur du fournisseur.",
      nodes:[
        {id:"a",type:"pc",x:4,y:40,label:"PC",detail:"10.20.0.42/24"},
        {id:"r",type:"router",x:38,y:40,label:"R1",detail:"LAN .1 | WAN 203.0.113.2/30"},
        {id:"isp",type:"router",x:68,y:40,label:"FAI",detail:"203.0.113.1/30"},
        {id:"web",type:"cloud",x:90,y:40,label:"Internet",detail:"réseaux distants"}
      ],
      links:[["a","r"],["r","isp"],["isp","web"]],
      fields:[
        {key:"pc_gw",label:"Gateway du PC",placeholder:"10.20.0.x",type:"ip",help:"Interface LAN de R1."},
        {key:"r_dest",label:"Route de R1 : destination",placeholder:"0.0.0.0/0",type:"text",help:"Tout ce que R1 ne connaît pas."},
        {key:"r_gw",label:"Route de R1 : next hop",placeholder:"203.0.113.x",type:"ip",help:"Le voisin directement connecté sur le /30."}
      ],
      hints:[
        "Le PC remet son trafic non local à R1. R1 remet son trafic inconnu au FAI.",
        "Sur 203.0.113.0/30, les deux adresses hôtes usuelles sont .1 et .2. R1 utilise .2, donc le voisin est .1.",
        "PC gateway 10.20.0.1 ; R1 destination 0.0.0.0/0 ; next hop 203.0.113.1."
      ],
      solution:"PC → 10.20.0.1. R1 → route 0.0.0.0/0 via 203.0.113.1. Chaque next hop est directement joignable sur le lien où il se trouve.",
      validate:function(v){var c=[];c.push(val(v,"pc_gw")==="10.20.0.1"?ok("Gateway du PC correcte."):no("Le PC doit viser 10.20.0.1."));c.push(val(v,"r_dest").replace(/\s/g,"")==="0.0.0.0/0"?ok("Route par défaut correcte."):no("R1 a besoin de 0.0.0.0/0."));c.push(val(v,"r_gw")==="203.0.113.1"?ok("Next hop FAI correct."):no("Le voisin WAN de R1 est 203.0.113.1."));return result(c);}
    },
    {
      id: 7,
      title: "Deux routeurs, deux réseaux",
      difficulty: "Intermédiaire +",
      goal: "Ajouter les routes statiques nécessaires dans les deux sens.",
      concepts: ["route statique", "retour", "next hop"],
      story: "R1 et R2 sont reliés par un petit réseau de transit /30. Chaque routeur doit apprendre où se trouve le LAN distant.",
      nodes:[
        {id:"a",type:"pc",x:2,y:42,label:"LAN A",detail:"192.168.10.0/24"},
        {id:"r1",type:"router",x:27,y:42,label:"R1",detail:"10.0.0.1/30"},
        {id:"r2",type:"router",x:58,y:42,label:"R2",detail:"10.0.0.2/30"},
        {id:"b",type:"pc",x:84,y:42,label:"LAN B",detail:"192.168.20.0/24"}
      ],
      links:[["a","r1"],["r1","r2"],["r2","b"]],
      fields:[
        {key:"r1_dest",label:"R1 : réseau distant",placeholder:"192.168.20.0/24",type:"text",help:"Le LAN situé derrière R2."},
        {key:"r1_gw",label:"R1 : next hop",placeholder:"10.0.0.x",type:"ip",help:"Interface de R2 sur le lien de transit."},
        {key:"r2_dest",label:"R2 : réseau distant",placeholder:"192.168.10.0/24",type:"text",help:"Le LAN situé derrière R1."},
        {key:"r2_gw",label:"R2 : next hop",placeholder:"10.0.0.x",type:"ip",help:"Interface de R1 sur le transit."}
      ],
      hints:[
        "R1 connaît déjà ses réseaux directement connectés, mais pas le LAN derrière R2. Même raisonnement dans l'autre sens.",
        "Pour R1, la destination distante est 192.168.20.0/24 et le voisin est 10.0.0.2. Pour R2, inverse les rôles.",
        "R1: 192.168.20.0/24 via 10.0.0.2. R2: 192.168.10.0/24 via 10.0.0.1."
      ],
      solution:"R1 ajoute 192.168.20.0/24 via 10.0.0.2. R2 ajoute 192.168.10.0/24 via 10.0.0.1. La route de retour est indispensable.",
      validate:function(v){var c=[];c.push(val(v,"r1_dest").replace(/\s/g,"")==="192.168.20.0/24"?ok("Destination R1 correcte."):no("R1 doit viser 192.168.20.0/24."));c.push(val(v,"r1_gw")==="10.0.0.2"?ok("Next hop R1 correct."):no("Depuis R1, le voisin est 10.0.0.2."));c.push(val(v,"r2_dest").replace(/\s/g,"")==="192.168.10.0/24"?ok("Destination R2 correcte."):no("R2 doit viser 192.168.10.0/24."));c.push(val(v,"r2_gw")==="10.0.0.1"?ok("Next hop R2 correct."):no("Depuis R2, le voisin est 10.0.0.1."));return result(c);}
    },
    {
      id: 8,
      title: "Découper un /24 sans chevauchement",
      difficulty: "Avancé",
      goal: "Créer deux sous-réseaux de tailles différentes à l'intérieur de 10.42.0.0/24.",
      concepts: ["VLSM", "capacité", "chevauchement"],
      story: "LAN A a besoin de 50 hôtes et LAN B de 20 hôtes. Les deux doivent tenir dans 10.42.0.0/24 et ne jamais se chevaucher.",
      nodes:[
        {id:"p",type:"cloud",x:12,y:40,label:"Bloc disponible",detail:"10.42.0.0/24"},
        {id:"a",type:"switch",x:48,y:22,label:"LAN A",detail:"≥ 50 hôtes"},
        {id:"b",type:"switch",x:48,y:60,label:"LAN B",detail:"≥ 20 hôtes"}
      ],
      links:[["p","a"],["p","b"]],
      fields:[
        {key:"a_net",label:"Réseau LAN A",placeholder:"10.42.0.0",type:"ip",help:"Entre une adresse réseau valide."},
        {key:"a_prefix",label:"Préfixe LAN A",placeholder:"/26",type:"cidr",help:"Capacité minimale pour 50 hôtes."},
        {key:"b_net",label:"Réseau LAN B",placeholder:"10.42.0.64",type:"ip",help:"Doit être dans le /24 parent et hors de LAN A."},
        {key:"b_prefix",label:"Préfixe LAN B",placeholder:"/27",type:"cidr",help:"Capacité minimale pour 20 hôtes."}
      ],
      hints:[
        "Choisis d'abord le plus grand réseau. 50 hôtes demandent au moins 62 adresses hôtes usuelles : /26. 20 hôtes demandent /27.",
        "Un /26 occupe 64 adresses et doit commencer sur 0, 64, 128 ou 192. Un /27 occupe 32 adresses et commence sur un multiple de 32.",
        "Exemple simple : LAN A 10.42.0.0/26 (.0–.63), LAN B 10.42.0.64/27 (.64–.95)."
      ],
      solution:"Une solution propre : A = 10.42.0.0/26 et B = 10.42.0.64/27. D'autres placements sont acceptés s'ils sont alignés, contenus dans le /24, assez grands et sans chevauchement.",
      validate:function(v){
        var c=[],ai,bi,ap,bp;
        safe(c,function(){ap=N.parsePrefix(val(v,"a_prefix"));if(N.hostCapacity(ap)<50)return no("LAN A est trop petit pour 50 hôtes.");return ap===26?ok("LAN A a la taille attendue : /26."):warn("LAN A fonctionne en /"+ap+", mais /26 est la taille attendue pour 50 hôtes.");},"Préfixe A invalide");
        safe(c,function(){bp=N.parsePrefix(val(v,"b_prefix"));if(N.hostCapacity(bp)<20)return no("LAN B est trop petit pour 20 hôtes.");return bp===27?ok("LAN B a la taille attendue : /27."):warn("LAN B fonctionne en /"+bp+", mais /27 est la taille attendue pour 20 hôtes.");},"Préfixe B invalide");
        safe(c,function(){ai=val(v,"a_net");ap=N.parsePrefix(val(v,"a_prefix"));if(!N.isNetworkAddress(ai,ap))return no("LAN A ne commence pas sur une frontière valide pour /"+ap+".");return N.containsNetwork("10.42.0.0",24,ai,ap)?ok("LAN A reste dans le bloc parent."):no("LAN A sort de 10.42.0.0/24.");},"Réseau A invalide");
        safe(c,function(){bi=val(v,"b_net");bp=N.parsePrefix(val(v,"b_prefix"));if(!N.isNetworkAddress(bi,bp))return no("LAN B ne commence pas sur une frontière valide pour /"+bp+".");return N.containsNetwork("10.42.0.0",24,bi,bp)?ok("LAN B reste dans le bloc parent."):no("LAN B sort de 10.42.0.0/24.");},"Réseau B invalide");
        safe(c,function(){return N.rangesOverlap(val(v,"a_net"),val(v,"a_prefix"),val(v,"b_net"),val(v,"b_prefix"))?no("Les deux sous-réseaux se chevauchent."):ok("Les plages A et B ne se chevauchent pas.");},"Impossible de comparer les plages");
        return result(c);
      }
    },
    {
      id: 9,
      title: "Le piège du chevauchement",
      difficulty: "Avancé",
      goal: "Placer un nouveau réseau de 50 hôtes à côté d'un /25 déjà utilisé.",
      concepts: ["overlap", "frontières", "plan d'adressage"],
      story: "Le réseau 192.168.50.0/25 existe déjà. Tu dois créer un deuxième LAN d'au moins 50 hôtes, toujours dans 192.168.50.0/24, sans toucher à la plage existante.",
      nodes:[
        {id:"a",type:"switch",x:14,y:40,label:"LAN existant",detail:"192.168.50.0/25"},
        {id:"b",type:"switch",x:65,y:40,label:"Nouveau LAN",detail:"≥ 50 hôtes"}
      ],
      links:[],
      fields:[
        {key:"net",label:"Adresse réseau du nouveau LAN",placeholder:"192.168.50.x",type:"ip",help:"Le /25 existant prend .0 à .127."},
        {key:"prefix",label:"Préfixe",placeholder:"/26",type:"cidr",help:"Il faut au moins 50 hôtes."}
      ],
      hints:[
        "Le /25 existant occupe 192.168.50.0 à 192.168.50.127. Toute nouvelle plage doit commencer après .127.",
        "50 hôtes ⇒ /26 minimum. Les frontières /26 du dernier octet sont 0, 64, 128 et 192.",
        "192.168.50.128/26 ou 192.168.50.192/26 conviennent : leurs plages ne croisent pas le /25 existant."
      ],
      solution:"Réponses acceptées : 192.168.50.128/26 ou 192.168.50.192/26. Un réseau comme 192.168.50.64/26 serait techniquement bien aligné, mais il est entièrement à l'intérieur du /25 existant et chevauche donc celui-ci.",
      validate:function(v){var c=[];safe(c,function(){var p=N.parsePrefix(val(v,"prefix"));if(N.hostCapacity(p)<50)return no("Ce réseau est trop petit pour 50 hôtes.");return p===26?ok("/26 fournit 62 hôtes usuels : c'est la réponse attendue."):warn("/"+p+" peut fonctionner s'il ne chevauche rien, mais /26 est la réponse attendue et la plus économe.");},"Préfixe invalide");safe(c,function(){var ip=val(v,"net"),p=N.parsePrefix(val(v,"prefix"));if(!N.isNetworkAddress(ip,p))return no("L'adresse saisie n'est pas une frontière de réseau /"+p+".");if(!N.containsNetwork("192.168.50.0",24,ip,p))return no("Le nouveau LAN doit rester dans 192.168.50.0/24.");if(N.rangesOverlap("192.168.50.0",25,ip,p))return no("Chevauchement : cette plage touche le réseau existant .0/25.");return ok("Le nouveau LAN est correctement placé hors du /25 existant.");},"Réseau invalide");return result(c);}
    },
    {
      id: 10,
      title: "Topologie complète",
      difficulty: "Final",
      goal: "Relier deux LAN et une sortie Internet en combinant gateway, routes statiques et route par défaut.",
      concepts: ["synthèse", "routage", "aller-retour"],
      story: "LAN A est derrière R1, LAN B derrière R2. R2 possède la sortie vers le FAI. Configure les routes manquantes pour que LAN A atteigne LAN B et Internet, et que le retour vers LAN A soit connu.",
      nodes:[
        {id:"a",type:"pc",x:1,y:44,label:"LAN A",detail:"10.1.0.0/24"},
        {id:"r1",type:"router",x:22,y:44,label:"R1",detail:"172.16.0.1/30"},
        {id:"r2",type:"router",x:48,y:44,label:"R2",detail:"172.16.0.2/30"},
        {id:"b",type:"pc",x:70,y:22,label:"LAN B",detail:"10.2.0.0/24"},
        {id:"i",type:"cloud",x:83,y:63,label:"FAI",detail:"198.51.100.1/30"}
      ],
      links:[["a","r1"],["r1","r2"],["r2","b"],["r2","i"]],
      fields:[
        {key:"a_gw",label:"Gateway d'un PC du LAN A",placeholder:"10.1.0.1",type:"ip",help:"Interface LAN de R1."},
        {key:"r1_b_dest",label:"R1 → LAN B : destination",placeholder:"10.2.0.0/24",type:"text",help:"Réseau situé derrière R2."},
        {key:"r1_b_gw",label:"R1 → LAN B : next hop",placeholder:"172.16.0.2",type:"ip",help:"Voisin R2 sur le transit."},
        {key:"r1_default_gw",label:"R1 : next hop de la route par défaut",placeholder:"172.16.0.2",type:"ip",help:"R2 possède la sortie Internet."},
        {key:"r2_return_dest",label:"R2 → LAN A : destination",placeholder:"10.1.0.0/24",type:"text",help:"Route de retour vers le LAN A."},
        {key:"r2_return_gw",label:"R2 → LAN A : next hop",placeholder:"172.16.0.1",type:"ip",help:"Voisin R1."},
        {key:"r2_default_gw",label:"R2 : next hop Internet",placeholder:"198.51.100.1",type:"ip",help:"Routeur du FAI."}
      ],
      hints:[
        "Découpe le problème en 3 : LAN A↔LAN B, LAN A→Internet, puis le chemin retour.",
        "R1 envoie 10.2.0.0/24 et sa route par défaut vers R2 (172.16.0.2). R2 doit connaître 10.1.0.0/24 via R1 et envoyer sa route par défaut au FAI.",
        "LAN A gw 10.1.0.1 ; R1: 10.2.0.0/24 via 172.16.0.2 et défaut via 172.16.0.2 ; R2: 10.1.0.0/24 via 172.16.0.1 et défaut via 198.51.100.1."
      ],
      solution:"Le chemin devient : PC A → R1 → R2 → LAN B ou FAI. Le retour vers LAN A est rendu possible par la route 10.1.0.0/24 via 172.16.0.1 sur R2. Ne jamais valider seulement l'aller.",
      validate:function(v){
        var expected={a_gw:"10.1.0.1",r1_b_dest:"10.2.0.0/24",r1_b_gw:"172.16.0.2",r1_default_gw:"172.16.0.2",r2_return_dest:"10.1.0.0/24",r2_return_gw:"172.16.0.1",r2_default_gw:"198.51.100.1"};
        var labels={a_gw:"Gateway LAN A",r1_b_dest:"Destination LAN B",r1_b_gw:"Next hop R1→R2",r1_default_gw:"Défaut de R1",r2_return_dest:"Route retour de R2",r2_return_gw:"Next hop retour",r2_default_gw:"Défaut de R2"};
        var c=[];Object.keys(expected).forEach(function(k){var got=val(v,k).replace(/\s/g,"");c.push(got===expected[k]?ok(labels[k]+" : correct."):no(labels[k]+" : à revoir."));});return result(c);
      }
    },
    {
      id: 11,
      title: "VLSM : trois LAN dans un /24",
      difficulty: "Complexe",
      goal: "Découper 10.60.0.0/24 pour 100, 50 et 20 hôtes sans aucun chevauchement.",
      concepts: ["VLSM", "alignement", "chevauchement"],
      story: "Tu disposes d'un seul /24. Commence toujours par le plus grand besoin, puis place les réseaux suivants sur une frontière valide.",
      nodes:[
        {id:"p",type:"cloud",x:12,y:44,label:"Bloc parent",detail:"10.60.0.0/24"},
        {id:"a",type:"switch",x:55,y:18,label:"LAN A",detail:"100 hôtes"},
        {id:"b",type:"switch",x:55,y:45,label:"LAN B",detail:"50 hôtes"},
        {id:"c",type:"switch",x:55,y:72,label:"LAN C",detail:"20 hôtes"}
      ],
      links:[["p","a"],["p","b"],["p","c"]],
      fields:[
        {key:"a_net",label:"LAN A : réseau",placeholder:"10.60.0.0",type:"ip",help:"100 hôtes demandent au minimum un /25."},
        {key:"a_prefix",label:"LAN A : masque",placeholder:"/25",type:"cidr",help:"Un /25 fournit 126 hôtes usuels."},
        {key:"b_net",label:"LAN B : réseau",placeholder:"10.60.0.128",type:"ip",help:"Place B après la fin de A, sur une frontière /26."},
        {key:"b_prefix",label:"LAN B : masque",placeholder:"/26",type:"cidr",help:"Un /26 fournit 62 hôtes usuels."},
        {key:"c_net",label:"LAN C : réseau",placeholder:"10.60.0.192",type:"ip",help:"Place C sur une frontière /27 encore libre."},
        {key:"c_prefix",label:"LAN C : masque",placeholder:"/27",type:"cidr",help:"Un /27 fournit 30 hôtes usuels."}
      ],
      hints:["Taille d'abord : 100→/25, 50→/26, 20→/27.","Une disposition simple est .0/25, .128/26 puis .192/27.","Compare toujours les plages complètes : réseau → broadcast."],
      solution:"A = 10.60.0.0/25, B = 10.60.0.128/26, C = 10.60.0.192/27 est une solution propre. D'autres placements alignés et sans chevauchement sont acceptables.",
      validate:function(v){
        var c=[], nets=[['a',100],['b',50],['c',20]], parsed=[];
        nets.forEach(function(x){safe(c,function(){var ip=val(v,x[0]+'_net'),p=N.parsePrefix(val(v,x[0]+'_prefix'));parsed.push([ip,p]);if(N.hostCapacity(p)<x[1])return no('LAN '+x[0].toUpperCase()+' est trop petit.');if(!N.isNetworkAddress(ip,p))return no('LAN '+x[0].toUpperCase()+' n’est pas aligné sur /'+p+'.');if(!N.containsNetwork('10.60.0.0',24,ip,p))return no('LAN '+x[0].toUpperCase()+' sort du bloc parent.');var expected={a:25,b:26,c:27}[x[0]];return p===expected?ok('LAN '+x[0].toUpperCase()+' utilise la taille attendue /'+expected+'.'):warn('LAN '+x[0].toUpperCase()+' fonctionne en /'+p+', mais /'+expected+' est la taille attendue pour ce besoin.');},'LAN '+x[0].toUpperCase()+' invalide');});
        safe(c,function(){for(var i=0;i<parsed.length;i++)for(var j=i+1;j<parsed.length;j++)if(N.rangesOverlap(parsed[i][0],parsed[i][1],parsed[j][0],parsed[j][1]))return no('Au moins deux LAN se chevauchent.');return ok('Aucun chevauchement entre les trois LAN.');},'Impossible de comparer les LAN');
        return result(c);
      }
    },
    {
      id: 12,
      title: "Route spécifique + route par défaut",
      difficulty: "Complexe",
      goal: "Faire choisir à R1 le bon next hop selon la destination.",
      concepts: ["route spécifique", "route par défaut", "next hop"],
      story: "R1 a deux voisins : R2 mène au LAN C, tandis que le FAI mène à Internet. Une destination précise ne doit pas partir vers le mauvais voisin.",
      nodes:[
        {id:"a",type:"pc",x:5,y:44,label:"LAN A",detail:"10.1.0.0/24"},
        {id:"r1",type:"router",x:35,y:44,label:"R1",detail:"routeur central"},
        {id:"r2",type:"router",x:68,y:24,label:"R2",detail:"10.0.12.2/30"},
        {id:"c",type:"pc",x:90,y:24,label:"LAN C",detail:"172.20.30.0/24"},
        {id:"isp",type:"cloud",x:78,y:66,label:"FAI",detail:"203.0.113.1/30"}
      ],
      links:[["a","r1"],["r1","r2"],["r2","c"],["r1","isp"]],
      fields:[
        {key:"dest",label:"R1 : destination précise",placeholder:"172.20.30.0/24",type:"text",help:"Le réseau situé derrière R2."},
        {key:"via",label:"R1 : next hop précis",placeholder:"10.0.12.2",type:"ip",help:"Le voisin R2, directement connecté."},
        {key:"default_dest",label:"R1 : route par défaut",placeholder:"0.0.0.0/0",type:"text",help:"Tout ce qui n'est pas couvert par une route plus précise."},
        {key:"default_via",label:"R1 : next hop défaut",placeholder:"203.0.113.1",type:"ip",help:"Le routeur du FAI."}
      ],
      hints:["Sépare le trafic LAN C du trafic Internet.","LAN C = 172.20.30.0/24 via R2. Le reste = 0.0.0.0/0 via FAI.","Un next hop doit être directement joignable par le routeur qui l'utilise."],
      solution:"R1 : 172.20.30.0/24 via 10.0.12.2, et 0.0.0.0/0 via 203.0.113.1.",
      validate:function(v){var e={dest:'172.20.30.0/24',via:'10.0.12.2',default_dest:'0.0.0.0/0',default_via:'203.0.113.1'},c=[];Object.keys(e).forEach(function(k){c.push(val(v,k).replace(/\s/g,'')===e[k]?ok(k+' correct.'):no(k+' à revoir.'));});return result(c);}
    },
    {
      id: 13,
      title: "Trois routeurs : penser au retour",
      difficulty: "Complexe +",
      goal: "Rendre joignables deux LAN séparés par trois routeurs.",
      concepts: ["multi-hop", "aller-retour", "routes statiques"],
      story: "LAN A est derrière R1 et LAN C derrière R3. R2 est au milieu. Chaque routeur doit savoir où envoyer le trafic qui n'est pas directement connecté.",
      nodes:[
        {id:"a",type:"pc",x:2,y:43,label:"LAN A",detail:"192.168.10.0/24"},
        {id:"r1",type:"router",x:22,y:43,label:"R1",detail:"10.0.12.1/30"},
        {id:"r2",type:"router",x:49,y:43,label:"R2",detail:"transit"},
        {id:"r3",type:"router",x:75,y:43,label:"R3",detail:"10.0.23.2/30"},
        {id:"c",type:"pc",x:96,y:43,label:"LAN C",detail:"192.168.30.0/24"}
      ],
      links:[["a","r1"],["r1","r2"],["r2","r3"],["r3","c"]],
      fields:[
        {key:"r1_dest",label:"R1 destination",placeholder:"192.168.30.0/24",type:"text",help:"Le LAN final à droite."},
        {key:"r1_via",label:"R1 next hop",placeholder:"10.0.12.2",type:"ip",help:"R2 sur le premier transit."},
        {key:"r2_left",label:"R2 → LAN A",placeholder:"192.168.10.0/24 via 10.0.12.1",type:"text",help:"Route de retour vers la gauche."},
        {key:"r2_right",label:"R2 → LAN C",placeholder:"192.168.30.0/24 via 10.0.23.2",type:"text",help:"Route vers la droite."},
        {key:"r3_dest",label:"R3 destination retour",placeholder:"192.168.10.0/24",type:"text",help:"Le LAN situé derrière R1."},
        {key:"r3_via",label:"R3 next hop retour",placeholder:"10.0.23.1",type:"ip",help:"R2 sur le second transit."}
      ],
      hints:["Dessine mentalement le trajet A→R1→R2→R3→C puis C→R3→R2→R1→A.","R2 a besoin de deux routes : une vers chaque LAN.","Le next hop est toujours le voisin immédiat, jamais le routeur deux sauts plus loin."],
      solution:"R1 → LAN C via 10.0.12.2 ; R2 → LAN A via 10.0.12.1 et → LAN C via 10.0.23.2 ; R3 → LAN A via 10.0.23.1.",
      validate:function(v){var e={r1_dest:'192.168.30.0/24',r1_via:'10.0.12.2',r2_left:'192.168.10.0/24via10.0.12.1',r2_right:'192.168.30.0/24via10.0.23.2',r3_dest:'192.168.10.0/24',r3_via:'10.0.23.1'},c=[];Object.keys(e).forEach(function(k){c.push(val(v,k).replace(/\s/g,'').toLowerCase()===e[k].toLowerCase()?ok(k+' correct.'):no(k+' à revoir.'));});return result(c);}
    },
    {
      id: 14,
      title: "Masques qui se marchent dessus",
      difficulty: "Expert",
      goal: "Créer deux réseaux autour d'une plage déjà réservée sans chevauchement.",
      concepts: ["overlap", "broadcast", "frontières CIDR"],
      story: "10.10.0.64/26 est déjà utilisé (.64 à .127). Place un petit LAN de 20 hôtes avant cette plage et un LAN de 60 hôtes après.",
      nodes:[
        {id:"a",type:"switch",x:15,y:25,label:"LAN à créer A",detail:"20 hôtes"},
        {id:"x",type:"switch",x:50,y:45,label:"Réseau réservé",detail:"10.10.0.64/26"},
        {id:"b",type:"switch",x:84,y:68,label:"LAN à créer B",detail:"60 hôtes"}
      ],
      links:[],
      fields:[
        {key:"a_net",label:"LAN A réseau",placeholder:"10.10.0.0",type:"ip",help:"20 hôtes = /27 minimum, avant .64."},
        {key:"a_prefix",label:"LAN A masque",placeholder:"/27",type:"cidr",help:"Le plus petit réseau suffisant est /27."},
        {key:"b_net",label:"LAN B réseau",placeholder:"10.10.0.128",type:"ip",help:"60 hôtes = /26, après la plage réservée."},
        {key:"b_prefix",label:"LAN B masque",placeholder:"/26",type:"cidr",help:"Un /26 fournit 62 hôtes usuels."}
      ],
      hints:["Le réseau réservé occupe exactement .64→.127.","Un /27 peut être .0/27 ou .32/27 avant lui. Le /26 suivant commence à .128.","Un masque plus large peut faire englober une plage que tu pensais séparée."],
      solution:"Exemple : A = 10.10.0.0/27 et B = 10.10.0.128/26. A peut aussi être 10.10.0.32/27.",
      validate:function(v){var c=[];safe(c,function(){var ip=val(v,'a_net'),p=N.parsePrefix(val(v,'a_prefix'));if(N.hostCapacity(p)<20)return no('LAN A est trop petit pour 20 hôtes.');if(!N.isNetworkAddress(ip,p))return no('LAN A mal aligné.');if(N.rangesOverlap(ip,p,'10.10.0.64',26))return no('LAN A chevauche la plage réservée.');if(!N.containsNetwork('10.10.0.0',24,ip,p))return no('LAN A hors du /24.');return p===27?ok('LAN A utilise la taille attendue /27.'):warn('LAN A fonctionne en /'+p+', mais /27 est la réponse attendue pour 20 hôtes.');},'LAN A invalide');safe(c,function(){var ip=val(v,'b_net'),p=N.parsePrefix(val(v,'b_prefix'));if(N.hostCapacity(p)<60)return no('LAN B est trop petit pour 60 hôtes.');if(!N.isNetworkAddress(ip,p))return no('LAN B mal aligné.');if(N.rangesOverlap(ip,p,'10.10.0.64',26))return no('LAN B chevauche la plage réservée.');if(!N.containsNetwork('10.10.0.0',24,ip,p))return no('LAN B hors du /24.');return p===26?ok('LAN B utilise la taille attendue /26.'):warn('LAN B fonctionne en /'+p+', mais /26 est la réponse attendue pour 60 hôtes.');},'LAN B invalide');return result(c);}
    },
    {
      id: 15,
      title: "Agrégation de routes",
      difficulty: "Expert",
      goal: "Remplacer quatre routes /24 contiguës par une seule route agrégée.",
      concepts: ["CIDR", "agrégation", "route statique"],
      story: "Derrière R2 se trouvent 192.168.8.0/24, .9.0/24, .10.0/24 et .11.0/24. R1 peut les résumer avec une seule route.",
      nodes:[
        {id:"r1",type:"router",x:18,y:44,label:"R1",detail:"route à compléter"},
        {id:"r2",type:"router",x:50,y:44,label:"R2",detail:"10.50.0.2/30"},
        {id:"lan",type:"switch",x:84,y:44,label:"4 LAN",detail:"192.168.8.0 → 11.0"}
      ],
      links:[["r1","r2"],["r2","lan"]],
      fields:[
        {key:"summary",label:"Réseau agrégé",placeholder:"192.168.8.0/22",type:"text",help:"Trouve le préfixe commun aux quatre /24."},
        {key:"via",label:"Next hop",placeholder:"10.50.0.2",type:"ip",help:"Le voisin R2."}
      ],
      hints:["Quatre /24 contigus représentent 1024 adresses.","1024 adresses = /22. Vérifie que le bloc commence sur une frontière /22.","192.168.8.0/22 couvre 192.168.8.0 à 192.168.11.255."],
      solution:"192.168.8.0/22 via 10.50.0.2.",
      validate:function(v){var c=[];c.push(val(v,'summary').replace(/\s/g,'')==='192.168.8.0/22'?ok('Agrégation correcte.'):no('Cherche le /22 qui couvre les quatre /24.'));c.push(val(v,'via')==='10.50.0.2'?ok('Next hop correct.'):no('Le next hop est R2 : 10.50.0.2.'));return result(c);}
    },
    {
      id: 16,
      title: "Deux liens de transit dans un /29",
      difficulty: "Expert",
      goal: "Découper 172.16.100.0/29 en deux liens point-à-point /30 sans chevauchement.",
      concepts: ["/30", "transit", "subnetting"],
      story: "Tu dois relier R1–R2 et R2–R3. Pour rester dans le modèle classique de NetPractice, chaque lien utilise un /30 distinct.",
      nodes:[
        {id:"r1",type:"router",x:16,y:44,label:"R1",detail:"Transit A"},
        {id:"r2",type:"router",x:50,y:44,label:"R2",detail:"2 interfaces"},
        {id:"r3",type:"router",x:84,y:44,label:"R3",detail:"Transit B"}
      ],
      links:[["r1","r2"],["r2","r3"]],
      fields:[
        {key:"net1",label:"Transit R1-R2",placeholder:"172.16.100.0",type:"ip",help:"Première frontière /30 dans le /29."},
        {key:"net2",label:"Transit R2-R3",placeholder:"172.16.100.4",type:"ip",help:"Deuxième frontière /30 dans le /29."}
      ],
      hints:["Un /29 contient 8 adresses. Deux /30 contiennent 4 adresses chacun.","Les frontières /30 avancent par pas de 4 dans le dernier octet.","Dans 172.16.100.0/29, les deux /30 sont .0/30 et .4/30."],
      solution:"R1–R2 = 172.16.100.0/30 ; R2–R3 = 172.16.100.4/30.",
      validate:function(v){var a=val(v,'net1'),b=val(v,'net2'),c=[];safe(c,function(){return N.isNetworkAddress(a,30)&&N.containsNetwork('172.16.100.0',29,a,30)?ok('Transit A valide.'):no('Transit A doit être un /30 du /29 parent.');},'Transit A invalide');safe(c,function(){return N.isNetworkAddress(b,30)&&N.containsNetwork('172.16.100.0',29,b,30)?ok('Transit B valide.'):no('Transit B doit être un /30 du /29 parent.');},'Transit B invalide');safe(c,function(){return N.rangesOverlap(a,30,b,30)?no('Les deux transits se chevauchent.'):ok('Les deux transits sont distincts.');},'Comparaison impossible');return result(c);}
    },
    {
      id: 17,
      title: "Internet : ne pas oublier le chemin retour",
      difficulty: "Expert +",
      goal: "Configurer le LAN interne, la sortie par défaut et la route de retour du routeur frontière.",
      concepts: ["default route", "retour", "route spécifique"],
      story: "R1 dessert 10.77.0.0/24 et sort via R2. R2 doit savoir revenir vers le LAN de R1, puis envoyer le reste au FAI.",
      nodes:[
        {id:"pc",type:"pc",x:3,y:44,label:"LAN",detail:"10.77.0.0/24"},
        {id:"r1",type:"router",x:28,y:44,label:"R1",detail:"172.31.0.1/30"},
        {id:"r2",type:"router",x:58,y:44,label:"R2",detail:"172.31.0.2/30"},
        {id:"isp",type:"cloud",x:88,y:44,label:"FAI",detail:"198.18.0.1/30"}
      ],
      links:[["pc","r1"],["r1","r2"],["r2","isp"]],
      fields:[
        {key:"pc_gw",label:"Gateway LAN",placeholder:"10.77.0.1",type:"ip",help:"Interface LAN de R1."},
        {key:"r1_default",label:"R1 next hop défaut",placeholder:"172.31.0.2",type:"ip",help:"R2 est le voisin qui mène vers Internet."},
        {key:"r2_return",label:"R2 destination retour",placeholder:"10.77.0.0/24",type:"text",help:"Réseau interne situé derrière R1."},
        {key:"r2_return_via",label:"R2 next hop retour",placeholder:"172.31.0.1",type:"ip",help:"R1 sur le transit."},
        {key:"r2_default",label:"R2 next hop Internet",placeholder:"198.18.0.1",type:"ip",help:"FAI directement connecté."}
      ],
      hints:["Valide séparément LAN→R1, R1→R2, puis retour R2→LAN.","R2 a besoin d'une route spécifique vers 10.77.0.0/24.","Une route par défaut n'efface pas le besoin d'une route de retour correcte."],
      solution:"LAN gw 10.77.0.1 ; R1 défaut via 172.31.0.2 ; R2 retour 10.77.0.0/24 via 172.31.0.1 ; R2 défaut via 198.18.0.1.",
      validate:function(v){var e={pc_gw:'10.77.0.1',r1_default:'172.31.0.2',r2_return:'10.77.0.0/24',r2_return_via:'172.31.0.1',r2_default:'198.18.0.1'},c=[];Object.keys(e).forEach(function(k){c.push(val(v,k).replace(/\s/g,'')===e[k]?ok(k+' correct.'):no(k+' à revoir.'));});return result(c);}
    },
    {
      id: 18,
      title: "Boss final : architecture complète",
      difficulty: "Boss",
      goal: "Combiner VLSM, deux transits, routes statiques et sortie Internet.",
      concepts: ["VLSM", "multi-hop", "Internet", "retour"],
      story: "Trois LAN sont répartis derrière R1, R2 et R3. R3 possède la sortie FAI. Complète les éléments essentiels pour que le LAN A atteigne le LAN C et Internet, avec retour.",
      nodes:[
        {id:"a",type:"pc",x:1,y:18,label:"LAN A",detail:"10.200.0.0/25"},
        {id:"r1",type:"router",x:20,y:42,label:"R1",detail:"10.255.0.1/30"},
        {id:"b",type:"pc",x:45,y:18,label:"LAN B",detail:"10.200.0.128/26"},
        {id:"r2",type:"router",x:47,y:45,label:"R2",detail:"transit central"},
        {id:"r3",type:"router",x:73,y:45,label:"R3",detail:"10.255.0.6/30"},
        {id:"c",type:"pc",x:75,y:18,label:"LAN C",detail:"10.200.0.192/27"},
        {id:"isp",type:"cloud",x:94,y:67,label:"FAI",detail:"203.0.113.9/30"}
      ],
      links:[["a","r1"],["r1","r2"],["b","r2"],["r2","r3"],["r3","c"],["r3","isp"]],
      fields:[
        {key:"a_gw",label:"LAN A gateway",placeholder:"10.200.0.1",type:"ip",help:"Interface de R1 dans le LAN A."},
        {key:"r1_c",label:"R1 → LAN C",placeholder:"10.200.0.192/27",type:"text",help:"Destination précise du LAN C."},
        {key:"r1_via",label:"R1 next hop",placeholder:"10.255.0.2",type:"ip",help:"R2 sur le premier transit."},
        {key:"r1_default",label:"R1 défaut via",placeholder:"10.255.0.2",type:"ip",help:"R2 mène vers R3 puis Internet."},
        {key:"r2_a",label:"R2 → LAN A",placeholder:"10.200.0.0/25 via 10.255.0.1",type:"text",help:"Route de retour vers R1."},
        {key:"r2_c",label:"R2 → LAN C",placeholder:"10.200.0.192/27 via 10.255.0.6",type:"text",help:"Route vers R3."},
        {key:"r3_a",label:"R3 → LAN A",placeholder:"10.200.0.0/25 via 10.255.0.5",type:"text",help:"Retour vers R2 sur le second transit."},
        {key:"r3_default",label:"R3 défaut via FAI",placeholder:"203.0.113.9",type:"ip",help:"Le voisin Internet directement connecté."}
      ],
      hints:["Commence par tracer seulement LAN A → LAN C, puis le retour.","Ensuite ajoute la sortie Internet : R1 peut utiliser R2 comme défaut, R3 utilise le FAI.","Ne saute jamais un routeur dans un next hop : indique le voisin directement connecté."],
      solution:"LAN A gw 10.200.0.1 ; R1 LAN C via R2 et défaut via R2 ; R2 connaît LAN A via R1 et LAN C via R3 ; R3 connaît LAN A via R2 et sort via 203.0.113.9.",
      validate:function(v){var e={a_gw:'10.200.0.1',r1_c:'10.200.0.192/27',r1_via:'10.255.0.2',r1_default:'10.255.0.2',r2_a:'10.200.0.0/25via10.255.0.1',r2_c:'10.200.0.192/27via10.255.0.6',r3_a:'10.200.0.0/25via10.255.0.5',r3_default:'203.0.113.9'},c=[];Object.keys(e).forEach(function(k){c.push(val(v,k).replace(/\s/g,'').toLowerCase()===e[k].toLowerCase()?ok(k+' correct.'):no(k+' à revoir.'));});return result(c);}
    },
    {
      id: 19,
      title: "Deux LAN, transit et sortie Internet",
      difficulty: "Expert ++",
      goal: "Configurer plusieurs interfaces et les routes qui permettent aux deux LAN d'atteindre Internet.",
      concepts: ["interfaces", "masques", "routes", "Internet"],
      story: "R2 dessert deux LAN et rejoint R1 par un lien de transit. R1 possède la sortie FAI. Les masques choisis doivent être cohérents avec les routes de retour.",
      nodes:[
        {id:"d",type:"pc",x:8,y:70,label:"HOME",detail:"172.20.8.14"},
        {id:"c",type:"pc",x:88,y:70,label:"OFFICE",detail:"192.168.44.10"},
        {id:"r2",type:"router",x:48,y:58,label:"R2",detail:"routeur des LAN"},
        {id:"r1",type:"router",x:48,y:25,label:"R1",detail:"10.250.0.1/30"},
        {id:"i",type:"cloud",x:84,y:20,label:"Internet",detail:"FAI 203.0.113.1/28"}
      ],
      links:[["d","r2"],["c","r2"],["r2","r1"],["r1","i"]],
      fields:[
        {key:"c_mask",label:"OFFICE : masque",placeholder:"/26",type:"cidr",help:"Le réseau attendu réserve 62 hôtes, mais un masque plus large peut aussi fonctionner s'il reste cohérent."},
        {key:"r2_c_ip",label:"R2 côté OFFICE",placeholder:"192.168.44.x",type:"ip",help:"Une adresse hôte du même sous-réseau que 192.168.44.10."},
        {key:"c_gw",label:"Gateway OFFICE",placeholder:"192.168.44.x",type:"ip",help:"La gateway doit être l'interface R2 du LAN OFFICE."},
        {key:"d_mask",label:"HOME : masque",placeholder:"/28",type:"cidr",help:"Le réseau attendu est un /28."},
        {key:"r2_d_ip",label:"R2 côté HOME",placeholder:"172.20.8.x",type:"ip",help:"Une adresse hôte du même sous-réseau que 172.20.8.14."},
        {key:"d_gw",label:"Gateway HOME",placeholder:"172.20.8.x",type:"ip",help:"La gateway doit être l'interface R2 du LAN HOME."},
        {key:"r2_transit_ip",label:"R2 côté transit",placeholder:"10.250.0.2",type:"ip",help:"R1 utilise déjà 10.250.0.1 sur le /30."},
        {key:"transit_mask",label:"Masque transit",placeholder:"/30",type:"cidr",help:"Un lien point-à-point classique utilise ici un /30."},
        {key:"r1_c_dest",label:"R1 route OFFICE",placeholder:"réseau/prefix",type:"text",help:"La destination doit correspondre exactement au réseau créé par le masque OFFICE."},
        {key:"r1_c_via",label:"R1 next hop OFFICE",placeholder:"10.250.0.2",type:"ip",help:"Le voisin directement connecté est R2."},
        {key:"r1_d_dest",label:"R1 route HOME",placeholder:"réseau/prefix",type:"text",help:"La destination doit correspondre exactement au réseau HOME."},
        {key:"r1_d_via",label:"R1 next hop HOME",placeholder:"10.250.0.2",type:"ip",help:"Les deux LAN sont derrière R2."},
        {key:"r2_default",label:"R2 route par défaut via",placeholder:"10.250.0.1",type:"ip",help:"Tout le trafic inconnu part vers R1."}
      ],
      hints:[
        "Commence par rendre chaque LAN local cohérent : hôte, masque, interface du routeur et gateway.",
        "Ensuite configure le transit 10.250.0.0/30 : R1=.1 et R2=.2.",
        "Enfin R1 doit avoir une route de retour vers chacun des réseaux réellement créés, et R2 une route par défaut vers R1."
      ],
      solution:"Exemple attendu : OFFICE /26 avec R2=192.168.44.1, HOME /28 avec R2=172.20.8.1, transit R2=10.250.0.2/30. R1 route 192.168.44.0/26 et 172.20.8.0/28 via 10.250.0.2 ; R2 défaut via 10.250.0.1.",
      validate:function(v){
        var c=[],cp,dp,cn,dn;
        safe(c,function(){cp=N.parsePrefix(val(v,'c_mask'));if(!N.sameSubnet('192.168.44.10',val(v,'r2_c_ip'),cp))return no('R2 côté OFFICE n’est pas dans le même réseau que le poste.');if(!N.isUsableHost(val(v,'r2_c_ip'),cp)||val(v,'r2_c_ip')==='192.168.44.10')return no('L’IP de R2 côté OFFICE n’est pas utilisable.');cn=N.subnetInfo('192.168.44.10',cp).network+'/'+cp;return cp===26?ok('Le LAN OFFICE utilise le /26 attendu.'):warn('Le LAN OFFICE fonctionne en /'+cp+', mais /26 est la réponse attendue.');},'Configuration OFFICE invalide');
        c.push(val(v,'c_gw')===val(v,'r2_c_ip')?ok('Gateway OFFICE cohérente.'):no('La gateway OFFICE doit être exactement l’IP de R2 sur ce LAN.'));
        safe(c,function(){dp=N.parsePrefix(val(v,'d_mask'));if(!N.sameSubnet('172.20.8.14',val(v,'r2_d_ip'),dp))return no('R2 côté HOME n’est pas dans le même réseau que le poste.');if(!N.isUsableHost(val(v,'r2_d_ip'),dp)||val(v,'r2_d_ip')==='172.20.8.14')return no('L’IP de R2 côté HOME n’est pas utilisable.');dn=N.subnetInfo('172.20.8.14',dp).network+'/'+dp;return dp===28?ok('Le LAN HOME utilise le /28 attendu.'):warn('Le LAN HOME fonctionne en /'+dp+', mais /28 est la réponse attendue.');},'Configuration HOME invalide');
        c.push(val(v,'d_gw')===val(v,'r2_d_ip')?ok('Gateway HOME cohérente.'):no('La gateway HOME doit être exactement l’IP de R2 sur ce LAN.'));
        safe(c,function(){var p=N.parsePrefix(val(v,'transit_mask'));if(p!==30)return no('Le transit doit utiliser /30 (ou 255.255.255.252).');return val(v,'r2_transit_ip')==='10.250.0.2'?ok('Transit R1-R2 correct.'):no('R2 doit utiliser 10.250.0.2 sur ce transit.');},'Transit invalide');
        safe(c,function(){return val(v,'r1_c_dest').replace(/\s/g,'')===cn?ok('Route de retour OFFICE correcte.'):no('R1 doit viser le réseau OFFICE réellement défini : '+cn+'.');},'Route OFFICE invalide');
        c.push(val(v,'r1_c_via')==='10.250.0.2'?ok('Next hop OFFICE correct.'):no('R1 doit envoyer OFFICE vers 10.250.0.2.'));
        safe(c,function(){return val(v,'r1_d_dest').replace(/\s/g,'')===dn?ok('Route de retour HOME correcte.'):no('R1 doit viser le réseau HOME réellement défini : '+dn+'.');},'Route HOME invalide');
        c.push(val(v,'r1_d_via')==='10.250.0.2'?ok('Next hop HOME correct.'):no('R1 doit envoyer HOME vers 10.250.0.2.'));
        c.push(val(v,'r2_default')==='10.250.0.1'?ok('Route par défaut de R2 correcte.'):no('R2 doit utiliser R1 (10.250.0.1) comme sortie par défaut.'));
        return result(c);
      }
    },
    {
      id: 20,
      title: "Switch, quatre hôtes et deux routeurs",
      difficulty: "Expert +++",
      goal: "Faire fonctionner plusieurs LAN, un switch, un transit inter-routeurs et une sortie Internet.",
      concepts: ["switch", "multi-LAN", "retour", "Internet"],
      story: "A et B partagent un switch derrière R1. C et D sont sur deux réseaux distincts derrière R2. Tous doivent pouvoir atteindre les réseaux distants et Internet.",
      nodes:[
        {id:"a",type:"pc",x:5,y:18,label:"Host A",detail:"192.168.70.20"},
        {id:"b",type:"pc",x:5,y:52,label:"Host B",detail:"192.168.70.100"},
        {id:"s",type:"switch",x:24,y:35,label:"Switch",detail:"LAN A/B"},
        {id:"r1",type:"router",x:44,y:35,label:"R1",detail:"vers Internet"},
        {id:"i",type:"cloud",x:45,y:7,label:"Internet",detail:"198.51.100.1/28"},
        {id:"r2",type:"router",x:66,y:35,label:"R2",detail:"10.99.0.2/30"},
        {id:"c",type:"pc",x:88,y:18,label:"Host C",detail:"10.33.0.12"},
        {id:"d",type:"pc",x:88,y:55,label:"Host D",detail:"172.22.5.130"}
      ],
      links:[["a","s"],["b","s"],["s","r1"],["r1","i"],["r1","r2"],["r2","c"],["r2","d"]],
      fields:[
        {key:"ab_mask",label:"LAN A/B masque",placeholder:"/25",type:"cidr",help:"A=.20 et B=.100 doivent rester dans le même LAN et il faut au moins 90 hôtes."},
        {key:"r1_lan_ip",label:"R1 côté switch",placeholder:"192.168.70.x",type:"ip",help:"Interface de R1 dans le LAN partagé."},
        {key:"a_gw",label:"Gateway A",placeholder:"192.168.70.x",type:"ip",help:"Doit être l’interface R1 côté switch."},
        {key:"b_gw",label:"Gateway B",placeholder:"192.168.70.x",type:"ip",help:"Même gateway que A."},
        {key:"c_mask",label:"LAN C masque",placeholder:"/27",type:"cidr",help:"Le besoin attendu est 20 hôtes."},
        {key:"r2_c_ip",label:"R2 côté C",placeholder:"10.33.0.x",type:"ip",help:"Interface locale de R2 pour Host C."},
        {key:"c_gw",label:"Gateway C",placeholder:"10.33.0.x",type:"ip",help:"Doit pointer vers R2."},
        {key:"d_mask",label:"LAN D masque",placeholder:"/26",type:"cidr",help:"Le besoin attendu est 50 hôtes."},
        {key:"r2_d_ip",label:"R2 côté D",placeholder:"172.22.5.x",type:"ip",help:"Interface locale de R2 pour Host D."},
        {key:"d_gw",label:"Gateway D",placeholder:"172.22.5.x",type:"ip",help:"Doit pointer vers R2."},
        {key:"r1_c_route",label:"R1 → LAN C",placeholder:"réseau/prefix",type:"text",help:"Route via le transit vers R2."},
        {key:"r1_d_route",label:"R1 → LAN D",placeholder:"réseau/prefix",type:"text",help:"Deuxième réseau derrière R2."},
        {key:"r1_via",label:"R1 next hop R2",placeholder:"10.99.0.2",type:"ip",help:"Voisin R2 sur le transit."},
        {key:"r2_return",label:"R2 → LAN A/B",placeholder:"réseau/prefix",type:"text",help:"Route de retour vers le switch derrière R1."},
        {key:"r2_via",label:"R2 next hop retour",placeholder:"10.99.0.1",type:"ip",help:"R1 sur le transit."},
        {key:"r2_default",label:"R2 défaut via",placeholder:"10.99.0.1",type:"ip",help:"Internet se trouve derrière R1."},
        {key:"r1_default",label:"R1 défaut Internet",placeholder:"198.51.100.1",type:"ip",help:"Passerelle FAI directement connectée."}
      ],
      hints:[
        "Résous d’abord les trois LAN locaux. Le switch n’ajoute aucun nouveau sous-réseau : A, B et R1 doivent partager le même.",
        "Puis traite R1↔R2 comme un lien /30 : R1=10.99.0.1, R2=10.99.0.2.",
        "Pour finir, écris les routes dans les deux sens. R2 utilise R1 comme route par défaut vers Internet."
      ],
      solution:"Attendu : LAN A/B /25, R1 dans 192.168.70.0/25 ; LAN C /27 ; LAN D /26. R1 route les deux LAN de R2 via 10.99.0.2. R2 route le LAN A/B via 10.99.0.1 et utilise R1 comme défaut ; R1 sort via 198.51.100.1.",
      validate:function(v){
        var c=[],abp,cp,dp,abn,cn,dn;
        safe(c,function(){abp=N.parsePrefix(val(v,'ab_mask'));if(N.hostCapacity(abp)<90)return no('Le LAN A/B est trop petit pour 90 hôtes.');if(!N.sameSubnet('192.168.70.20','192.168.70.100',abp))return no('A et B ne sont pas dans le même sous-réseau avec ce masque.');if(!N.sameSubnet('192.168.70.20',val(v,'r1_lan_ip'),abp)||!N.isUsableHost(val(v,'r1_lan_ip'),abp))return no('R1 côté switch n’est pas une IP valide du LAN A/B.');abn=N.subnetInfo('192.168.70.20',abp).network+'/'+abp;return abp===25?ok('LAN A/B : /25 est la taille attendue.'):warn('LAN A/B fonctionne en /'+abp+', mais /25 est la réponse attendue pour 90 hôtes.');},'LAN A/B invalide');
        c.push(val(v,'a_gw')===val(v,'r1_lan_ip')&&val(v,'b_gw')===val(v,'r1_lan_ip')?ok('Gateways A et B correctes.'):no('A et B doivent utiliser l’interface R1 côté switch comme gateway.'));
        safe(c,function(){cp=N.parsePrefix(val(v,'c_mask'));if(N.hostCapacity(cp)<20)return no('LAN C trop petit.');if(!N.sameSubnet('10.33.0.12',val(v,'r2_c_ip'),cp)||!N.isUsableHost(val(v,'r2_c_ip'),cp))return no('R2 côté C n’est pas dans le bon LAN.');cn=N.subnetInfo('10.33.0.12',cp).network+'/'+cp;return cp===27?ok('LAN C : /27 attendu.'):warn('LAN C fonctionne en /'+cp+', mais /27 est la réponse attendue.');},'LAN C invalide');
        c.push(val(v,'c_gw')===val(v,'r2_c_ip')?ok('Gateway C correcte.'):no('Gateway C doit être l’interface R2 côté C.'));
        safe(c,function(){dp=N.parsePrefix(val(v,'d_mask'));if(N.hostCapacity(dp)<50)return no('LAN D trop petit.');if(!N.sameSubnet('172.22.5.130',val(v,'r2_d_ip'),dp)||!N.isUsableHost(val(v,'r2_d_ip'),dp))return no('R2 côté D n’est pas dans le bon LAN.');dn=N.subnetInfo('172.22.5.130',dp).network+'/'+dp;return dp===26?ok('LAN D : /26 attendu.'):warn('LAN D fonctionne en /'+dp+', mais /26 est la réponse attendue.');},'LAN D invalide');
        c.push(val(v,'d_gw')===val(v,'r2_d_ip')?ok('Gateway D correcte.'):no('Gateway D doit être l’interface R2 côté D.'));
        safe(c,function(){return val(v,'r1_c_route').replace(/\s/g,'')===cn?ok('Route R1 vers C correcte.'):no('R1 doit viser '+cn+'.');},'Route C invalide');
        safe(c,function(){return val(v,'r1_d_route').replace(/\s/g,'')===dn?ok('Route R1 vers D correcte.'):no('R1 doit viser '+dn+'.');},'Route D invalide');
        c.push(val(v,'r1_via')==='10.99.0.2'?ok('R1 utilise le bon next hop vers R2.'):no('R1 doit utiliser 10.99.0.2 pour les réseaux de R2.'));
        safe(c,function(){return val(v,'r2_return').replace(/\s/g,'')===abn?ok('Route retour R2 correcte.'):no('R2 doit viser '+abn+' pour revenir vers A/B.');},'Route retour invalide');
        c.push(val(v,'r2_via')==='10.99.0.1'?ok('Next hop retour correct.'):no('R2 doit revenir via 10.99.0.1.'));
        c.push(val(v,'r2_default')==='10.99.0.1'?ok('Défaut R2 correct.'):no('R2 doit envoyer son trafic Internet vers R1.'));
        c.push(val(v,'r1_default')==='198.51.100.1'?ok('Défaut Internet de R1 correct.'):no('R1 doit sortir via le FAI 198.51.100.1.'));
        return result(c);
      }
    },
    {
      id: 21,
      title: "Boss : chevauchements, routes et Internet",
      difficulty: "Boss ++",
      goal: "Résoudre une topologie dense où plusieurs réseaux partagent le même /24 parent sans jamais se chevaucher.",
      concepts: ["VLSM", "overlap", "switch", "routage", "Internet"],
      story: "H1 et H2 partagent un switch. H4 est sur un second LAN du même bloc 10.240.0.0/24, et le transit R1-R2 occupe les dernières adresses du bloc. Un masque trop large peut donc casser toute la topologie.",
      nodes:[
        {id:"h1",type:"pc",x:5,y:18,label:"H1",detail:"10.240.0.2"},
        {id:"h2",type:"pc",x:5,y:50,label:"H2",detail:"10.240.0.42"},
        {id:"s",type:"switch",x:23,y:34,label:"Switch",detail:"LAN A · ≥90 hôtes"},
        {id:"r1",type:"router",x:43,y:34,label:"R1",detail:"Internet + LAN A"},
        {id:"i",type:"cloud",x:43,y:7,label:"Internet",detail:"203.0.113.1/28"},
        {id:"r2",type:"router",x:65,y:34,label:"R2",detail:"transit .254/30"},
        {id:"h4",type:"pc",x:88,y:18,label:"H4",detail:"10.240.0.131 · ≥50 hôtes"},
        {id:"h3",type:"pc",x:88,y:55,label:"H3",detail:"172.18.0.10 · ≥20 hôtes"}
      ],
      links:[["h1","s"],["h2","s"],["s","r1"],["r1","i"],["r1","r2"],["r2","h4"],["r2","h3"]],
      fields:[
        {key:"lan_a_mask",label:"LAN A masque",placeholder:"/25",type:"cidr",help:"Il faut ≥90 hôtes, mais la plage ne doit pas englober les autres réseaux du /24."},
        {key:"h1_gw",label:"Gateway H1",placeholder:"10.240.0.1",type:"ip",help:"R1 côté switch."},
        {key:"h2_gw",label:"Gateway H2",placeholder:"10.240.0.1",type:"ip",help:"Même gateway que H1."},
        {key:"lan_b_mask",label:"LAN H4 masque",placeholder:"/26",type:"cidr",help:"H4=.131 et il faut ≥50 hôtes."},
        {key:"r2_b_ip",label:"R2 côté H4",placeholder:"10.240.0.129",type:"ip",help:"Une IP utilisable du réseau de H4."},
        {key:"h4_gw",label:"Gateway H4",placeholder:"10.240.0.129",type:"ip",help:"Interface R2 du LAN H4."},
        {key:"lan_c_mask",label:"LAN H3 masque",placeholder:"/27",type:"cidr",help:"Il faut ≥20 hôtes dans 172.18.0.0."},
        {key:"r2_c_ip",label:"R2 côté H3",placeholder:"172.18.0.1",type:"ip",help:"Interface R2 du LAN H3."},
        {key:"h3_gw",label:"Gateway H3",placeholder:"172.18.0.1",type:"ip",help:"Interface locale de R2."},
        {key:"transit_mask",label:"Transit R1-R2 masque",placeholder:"/30",type:"cidr",help:"R1=10.240.0.253, R2=10.240.0.254."},
        {key:"r1_b_route",label:"R1 → LAN H4",placeholder:"réseau/prefix",type:"text",help:"R1 rejoint H4 via R2."},
        {key:"r1_c_route",label:"R1 → LAN H3",placeholder:"réseau/prefix",type:"text",help:"R1 rejoint H3 via R2."},
        {key:"r1_via",label:"R1 next hop",placeholder:"10.240.0.254",type:"ip",help:"R2 sur le transit."},
        {key:"r2_a_route",label:"R2 → LAN A",placeholder:"réseau/prefix",type:"text",help:"Route de retour vers H1/H2."},
        {key:"r2_via",label:"R2 next hop retour",placeholder:"10.240.0.253",type:"ip",help:"R1 sur le transit."},
        {key:"r2_default",label:"R2 défaut via",placeholder:"10.240.0.253",type:"ip",help:"Internet est derrière R1."},
        {key:"r1_default",label:"R1 défaut Internet",placeholder:"203.0.113.1",type:"ip",help:"FAI directement connecté."}
      ],
      hints:[
        "Dessine d'abord les plages dans 10.240.0.0/24 : LAN A, LAN H4, puis transit 10.240.0.252/30.",
        "LAN A a besoin de /25 : .0→.127. LAN H4 a besoin de /26 : .128→.191. Le transit .252/30 reste alors séparé.",
        "Une fois les plages correctes, le routage redevient classique : R1 route les LAN de R2 via .254 ; R2 revient vers LAN A via .253 et utilise R1 comme défaut."
      ],
      solution:"LAN A 10.240.0.0/25 avec gateway 10.240.0.1 ; LAN H4 10.240.0.128/26 avec R2=10.240.0.129 ; LAN H3 172.18.0.0/27 avec R2=172.18.0.1 ; transit 10.240.0.252/30 (.253/.254). R1 route les LAN de R2 via .254 ; R2 route LAN A et Internet via .253.",
      validate:function(v){
        var c=[],ap,bp,cp,an,bn,cn;
        safe(c,function(){ap=N.parsePrefix(val(v,'lan_a_mask'));if(N.hostCapacity(ap)<90)return no('LAN A est trop petit pour 90 hôtes.');if(!N.sameSubnet('10.240.0.2','10.240.0.42',ap))return no('H1 et H2 ne sont pas dans le même LAN.');an=N.subnetInfo('10.240.0.2',ap);return ap===25?ok('LAN A utilise le /25 attendu.'):warn('LAN A fonctionne localement en /'+ap+', mais vérifie qu’il ne chevauche pas les autres réseaux ; /25 est attendu.');},'LAN A invalide');
        c.push(val(v,'h1_gw')==='10.240.0.1'&&val(v,'h2_gw')==='10.240.0.1'?ok('Gateways H1/H2 correctes.'):no('H1 et H2 doivent utiliser 10.240.0.1.'));
        safe(c,function(){bp=N.parsePrefix(val(v,'lan_b_mask'));if(N.hostCapacity(bp)<50)return no('LAN H4 trop petit pour 50 hôtes.');if(!N.sameSubnet('10.240.0.131',val(v,'r2_b_ip'),bp)||!N.isUsableHost(val(v,'r2_b_ip'),bp))return no('R2 côté H4 n’est pas dans le bon LAN.');bn=N.subnetInfo('10.240.0.131',bp);return bp===26?ok('LAN H4 utilise le /26 attendu.'):warn('LAN H4 fonctionne localement en /'+bp+', mais /26 est attendu.');},'LAN H4 invalide');
        c.push(val(v,'h4_gw')===val(v,'r2_b_ip')?ok('Gateway H4 correcte.'):no('Gateway H4 doit être l’interface R2 de ce LAN.'));
        safe(c,function(){cp=N.parsePrefix(val(v,'lan_c_mask'));if(N.hostCapacity(cp)<20)return no('LAN H3 trop petit pour 20 hôtes.');if(!N.sameSubnet('172.18.0.10',val(v,'r2_c_ip'),cp)||!N.isUsableHost(val(v,'r2_c_ip'),cp))return no('R2 côté H3 n’est pas dans le bon LAN.');cn=N.subnetInfo('172.18.0.10',cp);return cp===27?ok('LAN H3 utilise le /27 attendu.'):warn('LAN H3 fonctionne en /'+cp+', mais /27 est attendu.');},'LAN H3 invalide');
        c.push(val(v,'h3_gw')===val(v,'r2_c_ip')?ok('Gateway H3 correcte.'):no('Gateway H3 doit être l’interface R2 de ce LAN.'));
        safe(c,function(){var tp=N.parsePrefix(val(v,'transit_mask'));return tp===30?ok('Transit /30 correct.'):no('Le transit 10.240.0.252 doit être en /30.');},'Masque transit invalide');
        safe(c,function(){if(!an||!bn)return no('Configure d’abord les LAN A et H4.');if(N.rangesOverlap(an.network,an.prefix,bn.network,bn.prefix))return no('LAN A et LAN H4 se chevauchent.');if(N.rangesOverlap(an.network,an.prefix,'10.240.0.252',30))return no('LAN A englobe le transit 10.240.0.252/30.');if(N.rangesOverlap(bn.network,bn.prefix,'10.240.0.252',30))return no('LAN H4 englobe le transit 10.240.0.252/30.');return ok('Les trois réseaux du bloc 10.240.0.0/24 sont séparés.');},'Vérification des chevauchements impossible');
        safe(c,function(){var expected=bn.network+'/'+bn.prefix;return val(v,'r1_b_route').replace(/\s/g,'')===expected?ok('Route R1 vers H4 correcte.'):no('R1 doit viser '+expected+'.');},'Route H4 invalide');
        safe(c,function(){var expected=cn.network+'/'+cn.prefix;return val(v,'r1_c_route').replace(/\s/g,'')===expected?ok('Route R1 vers H3 correcte.'):no('R1 doit viser '+expected+'.');},'Route H3 invalide');
        c.push(val(v,'r1_via')==='10.240.0.254'?ok('Next hop R1 correct.'):no('R1 doit passer par R2 = 10.240.0.254.'));
        safe(c,function(){var expected=an.network+'/'+an.prefix;return val(v,'r2_a_route').replace(/\s/g,'')===expected?ok('Route retour R2 vers LAN A correcte.'):no('R2 doit viser '+expected+'.');},'Route retour invalide');
        c.push(val(v,'r2_via')==='10.240.0.253'?ok('Next hop retour R2 correct.'):no('R2 doit revenir via R1 = 10.240.0.253.'));
        c.push(val(v,'r2_default')==='10.240.0.253'?ok('Route par défaut R2 correcte.'):no('R2 doit utiliser R1 comme sortie par défaut.'));
        c.push(val(v,'r1_default')==='203.0.113.1'?ok('Route par défaut Internet de R1 correcte.'):no('R1 doit sortir via 203.0.113.1.'));
        return result(c);
      }
    }
  ];
})();
