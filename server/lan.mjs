import { networkInterfaces } from 'node:os';

/*
 * Picking the address a guest's phone can actually reach is harder than it
 * looks. A laptop typically has several non-internal IPv4 addresses at once:
 * real wifi, a VPN tunnel, and virtual adapters from WSL, Docker, VirtualBox
 * or Hyper-V. Choosing the wrong one produces a QR code that silently fails.
 *
 * Interface names are also platform-specific, which is the trap: matching only
 * Unix names like en0 and eth0 means Windows "Wi-Fi" goes unrecognised while a
 * virtual "Ethernet 2" gets preferred.
 */

/** Virtual, tunnel and point-to-point adapters. Never the right answer. */
const VIRTUAL =
  /(^utun|^ipsec|^tun\d|^tap|^ppp|^awdl|^llw|^bridge|^docker|^veth|vethernet|virtualbox|vmware|hyper-?v|loopback|bluetooth|tailscale|zerotier|wireguard|wsl|vpn|pseudo)/i;

/** Real wifi and wired adapters across macOS, Linux and Windows. */
const PHYSICAL = /(^en\d|^eth\d|^wl|^ethernet|wi-?fi|wlan|wireless)/i;

/**
 * Addresses a phone on the same network might reach, best first.
 *
 * @param {NodeJS.Dict<import('node:os').NetworkInterfaceInfo[]>} [interfaces]
 *   Injectable for testing; defaults to this machine's interfaces.
 * @returns {{name: string, address: string, rank: number}[]}
 */
export function lanCandidates(interfaces = networkInterfaces()) {
  const found = [];

  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries ?? []) {
      // Node <18 reports family as a number in some builds.
      const isIPv4 = entry.family === 'IPv4' || entry.family === 4;
      if (!isIPv4 || entry.internal) continue;

      let rank;
      if (entry.address.startsWith('169.254.')) {
        // Link-local: the adapter has no DHCP lease, so it is not usable.
        rank = 3;
      } else if (VIRTUAL.test(name)) {
        rank = 2;
      } else if (PHYSICAL.test(name)) {
        rank = 0;
      } else {
        rank = 1;
      }

      found.push({ name, address: entry.address, rank });
    }
  }

  return found.sort((a, b) => a.rank - b.rank);
}

/** Human-readable note for why a candidate is likely to fail. */
export function candidateNote(candidate) {
  if (candidate.rank === 2) return 'virtual or VPN adapter, usually not reachable';
  if (candidate.rank === 3) return 'no network assigned to this adapter';
  return '';
}
