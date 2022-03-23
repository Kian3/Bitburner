/** @param {NS} ns **/
// Post reset unattended start-up script that requires that the Singularity functions
// are available to the player (SF4 or in BitNode 4).  Outside of BN1, this script 
// has a much higher RAM footprint, but so long as there are the prerequisites are
// met, should work.
//
// Author: Daniel Glasser
// Date:   2022-01-29
// Tested with Bitburner v1.4.0 (Steam and Github)
// Formatted with the built-in Bitburner 'nano' editor, so the tabs vs. spaces
// may look funky when viewed elsewhere.
// License: I don't know.  Does Creative Commons with no attribution required work?
//          'Public domain' has fallen out of favor, but I'm an ancient programmer
//          ("annoying computers since 1977"), so I'm sort of clueless about what
//          might be appropriate for this forum and type of script.
//
// This is a work in progress. There is a lot of room for improvement. It is posted
// more as an example for less experienced NetScript programmers than as a
// universally useful tool.  I have tried to describe everything it does and why
// it does it with in-line comments.  The comments are as accurate as practical
// in the time I had available to work on them.
//
// With one exception, the functions in this file are written by me, the one that
// I cribbed from another author's script ('serverPath') calls itself out in the
// out in the comment block at the beginning. Unfortunately, I don't remember
// who wrote the original; I modified it over the weeks I've been playing, its
// name has been changed, and I can't find the original in downloaded files;
// I probably copy/pasted it from some blog post. All the comments are my own,
// though.
//
// As it stands now, this script requires around 12GB of RAM to run in BN4 without
// SF4; I have included the information from the 'mem' command as a coment block
// at the end of this file. Because of this, it should only be used when there is
// enough RAM on the home server to have it hanging around until all of the things
// that are automated by this script have been completed - currently, that's the
// 'backdoor' stuff.
//
// The script does not yet handle obtaining the programs required to open ports
// required to root a given server in the backdoor list, though this could be
// added. For now, the user must obtain those programs either by manually creating
// them, buying them from the darkweb, or through an augmentation that makes them
// available after that augmentation is installed. (CashRoot Starter Set, etc.)
//
// The script assumes that the player is on 'home' and in 'Sector-12' when it is
// started.
//
// Here is what this does (so far):
//   1) Starts 'prune-spider.h' running on 'home' with a prune level of 0 (dollars)
//   2) Goes to Rothman University and studies Computer Science unless the player
//      has a hacking level > 'minHackingLevel', which can be set below.
//   3) When the hacking level has reached 'minHackingLevel', it goes into a loop
//      to install backdoors on a list of servers by navigating to the each
//      un-backdoored server when root access is gained, installing a backdoor
//      on it, then navigating back to the server the player was on when the the
//      victim server became eligable for backdoor installation. This might look
//      odd in the terminal while it's happening, and maybe even be disruptive to
//      the user if they are typing commands in the terminal at the time.  A sticky
//      'toast' is posted for each server that gets a backdoor installed so that
//      if the user is not watching when it happens, they will see the toast when
//      they get back to the game, and then dismiss the toast by clicking on it.
//   *) Eventually, there will be more things like dealing with faction invitations,
//      corporation employment, faction/corporation work, crimes, purchasing a TOR
//      router, obtaining required .exes, and other things to allow more unattended
//      progression toward the goals (whatever those are).
//

// ********************** Manifest constant definitions ***************************
// These declarations/definitions configure various aspects of this script
//
// Could be a little more precise by checking the minimum hacking level various
// servers, but 100 is where the first tier servers (connected directly to 'home')
// top out, and is sufficient to hack server CSEC; by the time that hacking skill
// level is achieved, other scripts often are earning more hacking experience than
// the free "Study Computer Science" course is.
const minHackingLevel = 100; // first tier hacking

// The 'spider' program to run at the beginning; in my case, this is a rather messy
// script named 'prune-spider.js' that takes an argument that has it kill the
// scripts that hack a given rooted server if the money available on it drops
// below the value of that argument.  I discovered that this was not a great
// strategy once I had a lot of augmentations and more than 1 core, because I
// sometimes ended up hacking all the money on a server that had a large maximum,
// and this would stop any production from that server due to scripts running on
// my home server (scripts running on other servers are not affected). I now
// always pass 0 for the threshold argument, but have not bothered to remove that
// functionality from the script itself.
// If anyone who does not have my 'prune-spider.js' chooses to adopt this script,
// they should change the initialization of 'spider' and 'spider_arg1', below,
// and if the script takes more arguments, add more 'spider_argX' defs and add
// them to the 'ns.exec()' call in 'main()'.
const spider = 'prune-spider.js';       // This is the 'auto-root' script
const spider_arg1 = '0';  // The argument to pass to the 'auto-root' script

// List of servers to back-door once they've been rooted by 'prune-spider'
// Note that this list should always contain the servers that must be backdoored
// for faction invitiations, and can contain other servers if having backdoors
// on them provides some benefit to the player; since installing backdoors can
// take a while, which might annoy the user if they are typing commands at the
// terminal when the script decides to backdoor on a server, the list should
// probably be kept short; let the user manually backdoor nodes that are
// non-essential to the unattended start-up process.  Because of RAM required
// to run this script, you might wish to leave out 'run4theh111z' and 'The-Cave',
// and 'w0rldD3m0n' should never be included in this script because that's
// only used during the end-game.
const backdoorList = ['CSEC', 'I.I.I.I', 'avmnite-02h', 'run4theh111z'];
// left out 'The-Cave' because it isn't important to join Daedalus early
// on in the play, and won't be reached every time a bitnode is started.

// List of programs that open ports on servers to hack
const hackProgList = ['FTPCrack.exe', 'BruteSSH.exe', 'relaySMTP.exe', 'SQLInject.exe', 'HTTPWorm.exe'];

// Function to get the current number of hacking programs available to player
// Parameters:
//   ns : The Netscript object
// Returns:
//   The number of prgrams from 'hackProgList' that were found in the players
//   root directory on 'home'
export function hackingProgramCount(ns) {
    var tools = 0;      // Don't assume any tools
    // check for the presence of each hacking program
    for (let progName of hackProgList) {
        // Does this one exist yet?
        if (ns.fileExists(progName, 'home')) {
            ++tools;  // Have this one
        }
    }
    return tools;  // tell the caller how many were found
} // end of hackingProgramCount()

// Function to get a path between two servers
// Parameters:
//   ns      : The NetScript object
//   parent  : Tracks the root of the search during recursion, should an empty string
//             when called from outside of the function itself
//   current : The server from which this recursion level is starting, should be the
//             current server when called from outside of the function itself
//   target  : The intended destination of the path, on success, will be the last
//                         element of the 'path' array on return to the caller
//   path    : An array into which the path between 'current' and 'target' will be
//             stored on successful return, where path[0] is 'current', and
//             path[path.length - 1] is 'target'
//
// Returns:
//   true  when a path between servers is found; 'path[]' will be non-empty
//   false when no path from the current server to the target server could be
//         constructed; 'path[]' will not be populated.
//
// Notes:
//   * I stole this 'serverPath()' function implementation from an example script,
//     changed its name and some parameter names, and added comments. Unfortunately,
//     I do not recall the source of the original so I can give proper credit.
//   * This function is only safe on tree-structured server node graphs, if there
//     are multiple paths between any two nodes in the graph, the back-track check
//     implemented in this function is not adequate to avoid cycles, and because
//     the 'scan()' function probably always returns the 'children' in the same
//     order for a given server node, once the cycle begins, it will recurse until
//     the stack cannot be extended any further, then blow up.
//     To prevent cycles, another parameter that records the nodes that have already
//     been visited on the way to the current node can be added (actually, it would
//     replace the 'parent' parameter); the 'current' node would be added to the
//     visited array, then check to see whether each neighbor child has already been
//     visited, and if not, then the recursion can continue for that neighbor.
//     Note that this would require that the caller always provide an empty
//     'visited' array.
//     I am not using the version that allows for a non-tree organization here
//     because Bitburner currently always organizes the nodes in a tree-like
//     arrangement (at most one path between nodes, any node can be viewed as
//     'root' for a search) so this version is good enough.
export function serverPath(ns, parent, current, target, path) {
    const children = ns.scan(current);   // find neighbors of 'current'
    for (let child of children) {    // Walk through the neighbor list
        // Avoid backtracking
        if (parent == child) {
            continue;  // we came from here, don't go back
        }
        // Check to see if we've reached our destination
        if (child == target) {   // Found the target
            // Build the end of the path by pushing servers into the path
            // from the top (aka, left)
            path.unshift(child); // Right-most is the target server
            path.unshift(current); // Just to the left of that is this one
            return true;  // The end of the path has been found
        }

        // When we get here, we've not yet found the target, so 'path'
        // will be empty, and we need to recurse for each neighbor
        // that we've not visited before until one of them leads
        // to the target (returns 'true')
        if (serverPath(ns, current, child, target, path)) {
            // This neighbor was on the path to the target;
            // Put the current server at the beginning of the
            // path and let the caller know that the destination was found
            path.unshift(current);      // path[0] is now 'current'
            return true; // 'path' contains a path
        }
    }
    // If execution reaches this location, no path to 'target' was found
    // from current; so long as this is not the zero'th recursion level,
    // this is not a problem because the recursive search is likely not
    // done, and perhaps a neigboring server will be be on the path to
    // the target.
    return false;       // No path from here, sorry
} // end of serverPath()

// Function to go to a university and study computer science until a required
// hacking level has been reached.
//
// Parameters:
//    ns     : The NetScript object
//    school : The institution to attend, assuming sector-12, that's
//             'rothman university', and this function assumes that the player
//             is in whatever city 'school' is in.
//    goal :   The hacking skill target that should be reached before returning;
//             note that the education, if started, continues out-of-focus until
//             some other work operation or the user terminates it, which ever
//             comes first.
// Returns:
//    No value is returned, however a sticky 'toast' is posted to inform the
//    user that the hacking level has met the goal
//
// Notes:
//   * If taking other courses (eg, to gain charisma experience) is desired
//     in the unattended start-up script, the course name should be added as
//     an argument.
export async function matriculate(ns, school, goal) {
    let learning = false;
    if (ns.getHackingLevel() < goal) {
        learning = ns.universityCourse(school, "Study Computer Science", false);
    }
    if (learning) {
        ns.tprint(`Taking a course starting at ${ns.getHackingLevel()} until ${goal}`);
        while (ns.getHackingLevel() < goal) {
            await ns.sleep(10000); // 10 seconds between checks
        }
        ns.toast(`Now at hacking level ${ns.getHackingLevel()}`, 'success', null);
    } else {
        ns.toast(`Not going to school, already at ${ns.getHackingLevel()}`, 'success', null);
    }
    await ns.sleep(10000)
} // end of matriculate()

// Function to install a backdoor on a server that the player has already gained root on
//
// Parameters:
//    ns     : Netscript object
//    victim : Name of server to install backdoor on
//
// Returns:
//    No value is returned, however a sticky 'toast' is displayed to tell the user that
//    the backdoor has been installed on the requested server.
export async function backdoorServer(ns, victim) {
    let pathToVictim = [];
    ns.disableLog('scan');      // don't log the 'scan()' calls from 'serverPath()'

    // Try to get a path to the victim server, and if that's successful, install
    // a backdoor on it
    if (serverPath(ns, '', ns.getCurrentServer(), victim, pathToVictim)) {
        // Got a path from 'here' to 'there'
        // Step through the path, connecting to each server along the path
        // until the victim server is reached
        for (const i in pathToVictim) {
            if (i > 0) { // Don't connect to the current server, we're already here
                ns.connect(pathToVictim[i]); // next server in the chain
            }
        } // navigate to the victim server

        // Inform the user that the server backdoor operation is staring on the victim
        ns.toast(`Installing backdoor on ${victim}`, 'info', 10000);
        await ns.installBackdoor();     // Install the backdoor

        // Now navigate back to where we started by walking the path backward
        let pathEnd = pathToVictim.length - 1;
        for (const i in pathToVictim) {
            if (i > 0) { // don't connect to the current server node
                ns.connect(pathToVictim[pathEnd - i]);
            }
        } // navigate back to the starting server

        // Post a sticy toast so the user knows that the victim server has been backdoored
        ns.toast(`Installed backdoor on ${pathToVictim[pathToVictim.length - 1]}`, 'success', null);
    } // path to victim server found
    
    ns.enableLog('scan');  // Allow 'scan()' to be logged again
} // end of backdoorServer()

// Main script function
//
// Parameters:
//    ns: the netscript object
// Returns:
//    Nothing explicit
//
// Notes:
//   * This script is intended to be run as the first script executed after
//     a soft reset such as after installing augmentations or entering the
//     bitnode after having just destroyed a bitnode.
//   * Requires access to the Singularity functions
//
export async function main(ns) {
    var done = false;
    var backdoorsRemaining = backdoorList.length;
    var backdoorAtLevel = new Array;

    // Initialize the backdoorAtLevel with the required hacking level for
    // each server in backdoorList; as each server has a backdoor installed,
    // the corresponding level will be set to -1 so that it is installed only
    // once.
    for (const i in backdoorList) {
        backdoorAtLevel[i] = ns.getServerRequiredHackingLevel(backdoorList[i]);
    }

    // Start the hacking spider script on 'home'
    ns.exec(spider, 'home', 1, spider_arg1);

    // we need to get to a hacking level great enough to hack and backdoor CSEC
    matriculate(ns, "Rothman University", minHackingLevel);

    // Enter the periodic operation loop to do operations that happen over
    // an extended period.
    while (!done) {  // loop until we have done everything we know how to do
        if (backdoorsRemaining > 0) { // Install any new backdoors that we can
            for (let i in backdoorList) { // check each server in the backdoor list
                let victim = backdoorList[i];    // candidate backdoor
                let hackLevel = ns.getHackingLevel(); // current player hack skill
                let hackPorts = ns.getServerNumPortsRequired(victim); // open ports
                let progCount = hackingProgramCount(ns); // how many .exes we have

                // Make sure we have the prerequisites conditions to backdoor
                // this victim and that we've not already done it
                if ((backdoorAtLevel[i] >= 0) && 
                    (hackLevel >= backdoorAtLevel[i]) &&
                    (hackPorts <= progCount)) {
                    // the auto-root script must gain root access for us
                    // (maybe this should be added to the pre-requisite condition)
                    if (ns.hasRootAccess(victim)) {
                        // Install a backdoor on the victim
                        await backdoorServer(ns, victim);
                        backdoorAtLevel[i] = -1; // done this one, don't do it again
                        backdoorsRemaining -= 1; // One less to install
                    } // install the backdoor
                } // requirements for backdoor met
            } // Installed any backdoors that we could
        } // backdoor installation

        // Figure out when to end the 'do things' loop
        // For now, only the backdoors are done in this loop, other operations may
        // be added later, and the conditions to set 'done' will need to be
        // extended.
        if (backdoorsRemaining < 1) {   // All backdoors installed?
            done = true;        // No pending operations for this loop
        } else {
            await ns.sleep(5000); // Sleep for 5 seconds before the next iteration
        }
    } // Periodic operation loop

    // For now, that's all we're doing; might add more later
    ns.toast(ns.getScriptName() + ' has done it\'s dirty work', 'info', null);
} // end of main()