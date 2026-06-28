import fs from "fs";
import path from "path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const header = `World Cup Tickets - Gillette Stadium
W89 vs W90 - World Cup - Quarter-Finals (Match 97)
Thu · Jul 9 · 4:00 PM

Gillette Stadium, Foxborough, Massachusetts, USA

Favorite

USD
EN
Search events, artists, teams and more
Sell
My Tickets
Sign In
Only 4% of tickets left
237
238
240
239
236
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
201
202
203
204
205
214
215
216
217
218
223
224
225
226
227
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
101
102
CL6
CL7
CL8
CL9
CL10
CL11
CL12
CL13
CL28
CL29
CL30
CL31
CL32
CL33
CL34
CL35
B10
B11
B12
B13
B14
B15
B16
B17
B18
B19
B20
B21
B22
B23
B24
B25
B26
B27
B28
B29
B30
B31
B60
B61
B62
B63
B64
B65
B66
B67
B68
B69
B70
B71A
B71B
B72
B73
B74
B75
B76
B77
B78
B79
B80
B81
R10
R11
R12
R13
R14
R15
R16
R17
R18
R19
R20
R21
R22
R23
R24
R25
R26
R27
R28
R29
R30
R31
R60
R61
R62
R63
R64
R65
R66
R67
R68
R69
R70
R72
R73
R74
R75
R76
R77
R78
R79
R80
R81
R71A
R71B
SCOREBOARD
SCOREBOARD
SKY LIGHT
SKY LIGHT
SKY LIGHT
SKY LIGHT
ENCORE BOSTON
HARBOUR TERRACE
OTHER TICKET OPTIONS:


Filters
Number of tickets

1 ticket
Price per ticket
US$2,466
US$11,092+
Sort by
Recommended

Price

Best deal

Best view

Features
Zones
Perks
Reset filters
View 3366 tickets
3366 tickets
`;

const out = path.join(scriptDir, "patches", "match-97-user-paste.txt");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, header, "utf8");
console.log("wrote", out);
