/** @param {NS} ns **/
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
	const servers = ["n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "max-hardware", "nectar-net", "CSEC", "neo-net", "zer0", "harakiri-sushi", "hong-fang-tea", "iron-gym", "phantasy", "silver-helix", "avmnite-02h", "omega-net", "the-hub", "I.I.I.I", "rothman-uni", "netlink", "catalyst", "summit-uni", "millenium-fitness", ".", "aevum-police", "rho-construction", "run4theh111z", "alpha-ent", "lexo-corp", "global-pharm", "unitalife", "univ-energy", "zb-institute", "vitalife", "titan-labs", "solaris", "microdyne", "helios", "omnia", "omnitek", "blade", "fulcrumtech", "powerhouse-fitness"];
	var target = "joesguns";
	var ram = 0;
	var cost = 0;
	var threads = 0;
	var i = 0;

		var ram = ((ns.getServerMaxRam("home"))-(ns.getServerUsedRam("home")));
		var cost = ns.getScriptRam("hack-xp.js");
		var threads = Math.floor((ram) / cost);
		ns.exec("hack-xp.js", "home", threads, target);



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

			// copy the hacking script over
			ns.killall(servers[i]);
			await ns.scp("hack-xp.js", servers[i]);

			// figure out how many threads we can run of our script
			var ram = ns.getServerMaxRam(servers[i]);
			var cost = ns.getScriptRam("hack-xp.js");
			var threads = Math.floor((ram) / cost);

			// execute script on the target server
			ns.exec("hack-xp.js", servers[i], threads, target);

			// increment the counter to move to the next server
			i++;
		}

	}

}