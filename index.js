module.exports = function etchingSupporter(mod) {
    const command = mod.command || mod.require.command;
    const warningDays = 7;
    const ownerID = -1;
    const type = 21;
    let name;
    let days;
    let enabled = false;
    const slotMapping = new Map([
        [1, 'Weapon'],
        [3, 'Body Armor'],
        [4, 'Hand Armor'],
        [5, 'Feet Armor'],
        [6, 'Left Earring'],
        [7, 'Right Earring'],
        [8, 'Left Ring'],
        [9, 'Right Ring'],
        [10, 'Necklace'],
        [19, 'Belt'],
        [20, 'Brooch'],
    ]);
    let equippedGear = new Set()

    mod.command.add('etch', (cmd) => {
        switch (cmd) {
            case "all":
                enabled = true;
                days = 60;
                executeRequest(name);
                break;
            default:
                enabled = true;
                days = warningDays;
                executeRequest(name)
        }
    })

    mod.hook('S_SHOW_ITEM_TOOLTIP', 14, e => {
            if (enabled) {
                var remainingDays = parseInt(e.etchingSecRemaining1) / 86400;
                remainingDays = parseInt(remainingDays)
                if (remainingDays < days && remainingDays > 0) {
                    command.message(slotMapping.get(e.slot) + ': ' + remainingDays + ' days left.');
                }
            }

        }
    )

    mod.hook('S_LOGIN', 14, e => {
            enabled = true;
            equippedGear.clear()
            days = warningDays;
            name = e.name;
            setTimeout(function () {
                executeRequest(name);
            }, 500);
        }
    )

    mod.hook('S_ITEMLIST', 4, e => {
            for (const item of e.items) {
                if (item.hasEtching && slotMapping.has(item.slot)) {
                    equippedGear.add(item.dbid)
                }
            }
        }
    )

    function requestItem(dbid, name) {
        mod.send('C_SHOW_ITEM_TOOLTIP_EX', 4, {
            type: type,
            dbid: dbid,
            extraValue: 0n,
            compareWith: 0,
            owner: {serverId: 0, playerId: ownerID, name: name}
        })
    }

    async function executeRequest(name) {
        if (equippedGear.size !== 0) {
            for (let entry of equippedGear) {
                requestItem(entry, name)
                await sleep(rand(500, 1000));
            }
            enabled = false;
        }
    }

    function sleep(ms) {
        return new Promise(function (resolve) {
            return setTimeout(resolve, ms);
        });
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}