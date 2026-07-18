Globals.peakL = 0.0;
Globals.peakR = 0.0;
function prepareToPlay(sampleRate, blockSize)
{
	
}
 function processBlock(channels)
{

local mL = 0.0;
local mR = 0.0;
local nCh = channels.length;
local len = channels[0].length;

for (i = 0; i < len; i++)
{
    local aL = Math.abs(channels[0][i]);
    local aR = nCh > 1 ? Math.abs(channels[1][i]) : aL;
    if (aL > mL) mL = aL;
    if (aR > mR) mR = aR;
}

Globals.peakL = mL;
Globals.peakR = mR;	
}
 function onControl(number, value)
{
	
}
 