//This script requires the formulas API in order to function

export async function main(ns) {
	var hosts = ['hong-fang-tea', 'sigma-cosmetics', 'joesguns', 'nectar-net', 'hong-fang-tea', 'harakiri-sushi', 'neo-net', 'zer0', 'max-hardware', 'iron-gym', 'phantasy', 'silver-helix', 'omega-net', 'crush-fitness', 'the-hub', 'johnson-ortho', 'comptek', 'netlink', 'rothman-uni', 'catalyst', 'summit-uni', 'aevum-police', 'rho-construction', 'millenium-fitness', 'alpha-ent', 'syscore', 'lexo-corp', 'zb-institute', 'snap-fitness', 'global-pharm', 'unitalife', 'galactic-cyber', 'solaris', 'zeus-med', 'aerocorp', 'univ-energy', 'deltaone', 'omnia', 'defcomm', 'icarus', 'zb-def', 'nova-med', 'taiyang-digital', 'infocomm', 'run4theh111z', 'titan-labs', 'microdyne', 'fulcrumtech', 'stormtech', 'kuai-gong', '.', 'b-and-a', 'nwo', 'applied-energetics', 'helios', '4sigma', 'blade', 'clarkinc', 'fulcrumassets', 'vitalife', 'omnitek', 'powerhouse-fitness', 'ecorp', 'megacorp', 'The-Cave', 'w0r1d_d43m0n'];
	var rhosts = [];
	var orderedHosts = [];
	var orderedMoney = [];
	var Money = 0;
	var i = 0;
	var s = 0;
	var x = 0;
	var v = 0;
	var chmm = 0;
	var f = ns.formulas.hacking;
	var player = ns.getPlayer();
	var fserver = "";
	var weakenTime = 0;
	var mps = 0;
	var contstantRam = ns.getScriptRam("/newserver/OP.ns"); //grabbing script RAM values
	var hackscriptRam = ns.getScriptRam("/newserver/hack.js");
	var growscriptRam = ns.getScriptRam("/newserver/grow.js");
	var weakenscriptRam = ns.getScriptRam("/newserver/weaken.js");
	var serverRam = ns.args[0];
	var weakenTime = 0;
	var growThreads = 0;
	var hackThreads = 0;
	var HPercent = 0;
	var GPercent = 0;
	var totalRamForRun = 0;
	var runs = 0;

	while (i < hosts.length) {
		if (ns.hasRootAccess(hosts[i]) == false) { i++ }
		else { rhosts.push(hosts[i]); }
		i++
	}

	i = 0;


	while (s < rhosts.length) {
		Money = 0;
		v = 0;
		while (i < rhosts.length) {


			fserver = ns.getServer(rhosts[i]);
			fserver.hackDifficulty = fserver.minDifficulty;
			growThreads = Math.round(((2.3 / (GPercent - 1)))); //Getting the amount of threads I need to grow 200%.  I only need 100% but I'm being conservative here
			hackThreads = Math.round((50 / HPercent));  //Getting the amount of threads I need to hack 50% of the funds
			var weakenThreads = ((2000) - ((ns.getServerMinSecurityLevel(rhosts[i])) / 0.05));
			weakenThreads = Math.round((weakenThreads - (growThreads * 0.004) - (hackThreads * 0.002)));
			HPercent = (f.hackPercent(fserver, player) * 100);
			GPercent = (f.growPercent(fserver, 1, player, 1));

			totalRamForRun = (hackscriptRam * hackThreads) + (growscriptRam * growThreads) + (weakenscriptRam * weakenThreads)
			runs = ns.getServerMaxRam("home") / totalRamForRun
			//Getting required threads to fully weaken the server
			weakenTime = (f.weakenTime(fserver, player) / 1000);


			chmm = ns.getServerMaxMoney(rhosts[i]);
			mps = (chmm / weakenTime) * (serverRam / totalRamForRun);
			chmm = mps;

			if (serverRam < totalRamForRun) { v = 1; }


			var item = orderedHosts.filter(serverExists);
			if (item == rhosts[i] || ns.hasRootAccess(rhosts[i]) == false || v == 1) { }
			else {


				if (chmm >= Money) {
					Money = chmm;
					x = i;

				}
			}
			i++;
		}
		orderedMoney.push(Money);
		orderedHosts.push(rhosts[x]);
		s++;
		i = 0;
	}

	ns.print(orderedHosts)








	function serverExists(server) {
		return server == rhosts[i];
	}


}
