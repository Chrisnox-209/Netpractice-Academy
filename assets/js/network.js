(function (root) {
  "use strict";

  function fail(message) { throw new Error(message); }

  function ipToInt(ip) {
    if (typeof ip !== "string") fail("Adresse IPv4 invalide");
    var parts = ip.trim().split(".");
    if (parts.length !== 4) fail("Une IPv4 contient 4 nombres séparés par des points");
    var nums = parts.map(function (part) {
      if (!/^\d{1,3}$/.test(part)) fail("Octet IPv4 invalide");
      var n = Number(part);
      if (n < 0 || n > 255) fail("Chaque octet doit être compris entre 0 et 255");
      return n;
    });
    return (((nums[0] << 24) >>> 0) + (nums[1] << 16) + (nums[2] << 8) + nums[3]) >>> 0;
  }

  function intToIp(value) {
    var n = Number(value) >>> 0;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
  }

  function parsePrefix(value) {
    var input = String(value).trim();
    if (!input) fail("Masque ou préfixe manquant");

    // Accepte les deux écritures utilisées en IPv4 : /25 ou 255.255.255.128.
    if (input.indexOf(".") !== -1) return maskToPrefix(input);

    var raw = input.replace(/^\//, "");
    if (!/^\d{1,2}$/.test(raw)) fail("Entre un CIDR comme /25 ou un masque comme 255.255.255.128");
    var p = Number(raw);
    if (p < 0 || p > 32) fail("Le CIDR doit être compris entre /0 et /32");
    return p;
  }

  function prefixToMask(prefix) {
    var p = parsePrefix(prefix);
    var mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
    return intToIp(mask);
  }

  function maskToPrefix(mask) {
    var n = ipToInt(mask);
    var bits = n.toString(2).padStart(32, "0");
    if (!/^1*0*$/.test(bits)) fail("Le masque n'est pas contigu");
    return bits.indexOf("0") === -1 ? 32 : bits.indexOf("0");
  }

  function networkInt(ip, prefix) {
    var p = parsePrefix(prefix);
    var n = ipToInt(ip);
    var mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
    return (n & mask) >>> 0;
  }

  function broadcastInt(ip, prefix) {
    var p = parsePrefix(prefix);
    var net = networkInt(ip, p);
    var hostMask = p === 32 ? 0 : Math.pow(2, 32 - p) - 1;
    return (net + hostMask) >>> 0;
  }

  function subnetInfo(ip, prefix) {
    var p = parsePrefix(prefix);
    var ipInt = ipToInt(ip);
    var net = networkInt(ip, p);
    var broadcast = broadcastInt(ip, p);
    var total = Math.pow(2, 32 - p);
    var usable;
    if (p === 32) usable = 1;
    else if (p === 31) usable = 2;
    else usable = Math.max(0, total - 2);
    return {
      ip: intToIp(ipInt),
      prefix: p,
      mask: prefixToMask(p),
      network: intToIp(net),
      broadcast: intToIp(broadcast),
      firstHost: p >= 31 ? intToIp(net) : intToIp(net + 1),
      lastHost: p >= 31 ? intToIp(broadcast) : intToIp(broadcast - 1),
      total: total,
      usable: usable,
      startInt: net,
      endInt: broadcast
    };
  }

  function sameSubnet(ipA, ipB, prefix) {
    return networkInt(ipA, prefix) === networkInt(ipB, prefix);
  }

  function rangesOverlap(ipA, prefixA, ipB, prefixB) {
    var a = subnetInfo(ipA, prefixA);
    var b = subnetInfo(ipB, prefixB);
    return a.startInt <= b.endInt && b.startInt <= a.endInt;
  }

  function isUsableHost(ip, prefix) {
    var p = parsePrefix(prefix);
    var n = ipToInt(ip);
    var info = subnetInfo(ip, p);
    if (p >= 31) return true;
    return n > info.startInt && n < info.endInt;
  }

  function hostCapacity(prefix) {
    var p = parsePrefix(prefix);
    if (p >= 31) return Math.pow(2, 32 - p);
    return Math.max(0, Math.pow(2, 32 - p) - 2);
  }

  function containsNetwork(parentIp, parentPrefix, childIp, childPrefix) {
    var parent = subnetInfo(parentIp, parentPrefix);
    var child = subnetInfo(childIp, childPrefix);
    return child.prefix >= parent.prefix && child.startInt >= parent.startInt && child.endInt <= parent.endInt;
  }

  function isNetworkAddress(ip, prefix) {
    return ipToInt(ip) === networkInt(ip, prefix);
  }

  function formatBinaryIp(ip) {
    return ip.split(".").map(function (x) {
      return Number(x).toString(2).padStart(8, "0");
    }).join(".");
  }

  var api = {
    ipToInt: ipToInt,
    intToIp: intToIp,
    parsePrefix: parsePrefix,
    prefixToMask: prefixToMask,
    maskToPrefix: maskToPrefix,
    networkInt: networkInt,
    broadcastInt: broadcastInt,
    subnetInfo: subnetInfo,
    sameSubnet: sameSubnet,
    rangesOverlap: rangesOverlap,
    isUsableHost: isUsableHost,
    hostCapacity: hostCapacity,
    containsNetwork: containsNetwork,
    isNetworkAddress: isNetworkAddress,
    formatBinaryIp: formatBinaryIp
  };

  root.NetUtils = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
