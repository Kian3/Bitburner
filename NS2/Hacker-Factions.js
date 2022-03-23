/** @param {NS} ns **/
const servers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "icarus"];
export async function main(ns) {
	function countPrograms() {
		var count = 0
		if (ns.fileExists("BruteSSH.exe"))
			count++;
		if (ns.fileExists("FTPCrack.exe"))
			count++;
		if (ns.fileExists("relaySMTP.exe"))
			count++;
		if (ns.fileExists("HTTPWorm.exe"))
			count++;
		if (ns.fileExists("SQLInject.exe"))
			count++;

		return count;
	}
	// try to open every port we can
	function breakPorts(hostname) {
		if (ns.fileExists("BruteSSH.exe"))
			ns.brutessh(hostname);
		if (ns.fileExists("FTPCrack.exe"))
			ns.ftpcrack(hostname);
		if (ns.fileExists("relaySMTP.exe"))
			ns.relaysmtp(hostname);
		if (ns.fileExists("HTTPWorm.exe"))
			ns.httpworm(hostname);
		if (ns.fileExists("SQLInject.exe"))
			ns.sqlinject(hostname);
	}
	var i = 0;

	while (i < servers.length) {
		// check if we have the required skill to hack the server
		if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(servers[i])) {
			await ns.sleep(10000);
		}
		else {
			// sleep until we can nuke the server
			while (countPrograms() < ns.getServerNumPortsRequired(servers[i])) {
				await ns.sleep(20000);
			}

			breakPorts(servers[i]);
			ns.nuke(servers[i]);

			ns.installBackdoor(servers[i])
			i++;
		}

	}

}