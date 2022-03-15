/** @param {NS} ns **/
export async function main(ns) {
	var target = ns.args[0];
	var moneyThresh = ns.getServerMaxMoney(target);
	var securityThresh = ns.getServerMinSecurityLevel(target) + 3;

	const programs = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe",
		"HTTPWorm.exe", "SQLInject.exe"];
	for (var i = 0; i < programs.length; ++i) {
		if (ns.fileExists(programs[i], "home")) {
			if (i === 0) { ns.brutessh(target); }
			if (i === 1) { ns.ftpcrack(target); }
			if (i === 2) { ns.relaysmtp(target); }
			if (i === 3) { ns.httpworm(target); }
			if (i === 4) { ns.sqlinject(target); }
		}
	}
	ns.nuke(target);

	while (true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await ns.weaken(target)
		}
		else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await ns.grow(target)
		}
		else {
			await ns.hack(target)
		}
	}
}
