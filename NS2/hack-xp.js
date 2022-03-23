/** @param {NS} ns **/
export async function main(ns) {
	var target = "joesguns"

	ns.nuke(target)

	while (true) {
		await ns.weaken(target)
	}

}