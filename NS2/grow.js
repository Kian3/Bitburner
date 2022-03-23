// Simple script to run grow on the server stated in the argument. Mainly used by master-hack.js
/** @param {NS} ns **/
export async function main(ns) {
	await ns.grow(ns.args[0]);
}
