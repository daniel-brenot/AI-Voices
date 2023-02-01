local sha = require("sha2")

--- @param path string
local function playText(path, npc)
	local ref = npc.reference
	tes3.removeSound { reference = ref }
	tes3.say {
		volume = 1.0,
		soundPath = path,
		reference = ref
	}
end

--- @param race string
--- @param sex string
--- @param infoId string
--- @return string
local function getPath(race, sex, infoId)
	return string.format("Vo\\AIV\\%s\\%s\\%s.mp3", race, sex, infoId)
end

--- @param isFemale boolean
--- @return string
local function getActorSex(isFemale)
	if isFemale then return "f" else return "m" end
end

--- @param path string
--- @return boolean
local function isPathValid(path)
	return lfs.fileexists("Data Files\\Sound\\" .. path)
end


---@param e infoGetTextEventData
local function onInfoGetText(e)
	local actor = e.info.actor
	if actor then
		local info = e.info

		local npc = info.actor.reference.object
		local race = npc.race.id:lower()
		local sex = getActorSex(npc.female)

		e.text = e:loadOriginalText()
		local ctxt = string.gsub(string.gsub(e.text, "@", ""), "#", "")
		local hash = string.upper(sha.md5(ctxt))

		local path = getPath(race, sex, hash)
		if isPathValid(path) then
			playText(path, npc)
		end
	end
end


---
local function init()
	debug.log("AI Voices loaded.")
	event.register(tes3.event.infoGetText, onInfoGetText)
end

event.register(tes3.event.initialized, init)