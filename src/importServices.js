// steps : read CSV -> parse -> insert batches -> compute age distribution

const fs = require('fs');
const readline = require('readline');
const { parseCsvLine } = require('./utils/csvParser');
const { flatToNested } = require('./utils/dotNotation');
const { pool } = require('./db');
const { group } = require('console');

require('dotenv').config();


async function runImport(filePath = null) {
    const csvPath = filePath || process.env.CSV_FILE_PATH;

    if(!csvPath){
        throw new Error("CSV_FILE_PATH environment variable not set");
    }

    const fileStream = fs.createReadStream(csvPath);

    const rl = readline.createInterface({
        input : fileStream,
        crlfDelay : Infinity,
    });

    let headers = [];
    let lineNumber = 0;
    const BATCH_SIZE = 1000;
    let batch = [];

    for await (const line of rl) {
        lineNumber++;

        // header line/row
        if(lineNumber === 1){
            headers = parseCsvLine(line);
            // console.log('Headers:', headers);
            continue;
        }

        if(!line.trim())continue;

        const values = parseCsvLine(line);
        const flatRecord = {};

        headers.forEach((h, idx) => {
            flatRecord[h] = values[idx] ?? null;
        });

        const nested = flatToNested(flatRecord);

        // console.log(`Line ${lineNumber} - flatRecord:`, flatRecord);
        // console.log(`Line ${lineNumber} - nested:`, nested);

        const firstName = nested.name?.firstName || nested.first_name || nested.firstName || '';
        const lastName = nested.name?.lastName || nested.last_name || nested.lastName || '';
        const ageRaw = nested?.age;
        const age = ageRaw !== null && ageRaw !== undefined ? Number(ageRaw) : NaN;


        //  console.log(`Line ${lineNumber} - firstName="${firstName}", lastName="${lastName}", age=${age}`);
         
        if(!firstName || !lastName || !Number.isFinite(age)){
            console.warn(`Skipping invalid record at line ${lineNumber}`);
            continue;
        }

        // separate address and additional info
        const { address = null, name, age : _age, ...rest } = nested;

        const userRow = {
            name : `${firstName} ${lastName}`.trim(),
            age,
            address : address || null,
            additional_info : Object.keys(rest).length > 0 ? rest : null,
        };

        batch.push(userRow);

        if(batch.length >= BATCH_SIZE){
            await insertBatch(batch);
            batch = [];
        }
    }

    if(batch.length > 0){
        await insertBatch(batch);
    }

    const dist = await getAgeDistribution();
    printAgeDistribution(dist);

    return buildStats(dist);
}


async function insertBatch(users) {
    if(!users.length)return;

    const values = [];
    const placeholders = [];

    users.forEach((u, idx) =>{
        const base = idx * 4;
        placeholders.push(
            `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
        );
        values.push(u.name, u.age, u.address, u.additional_info);
    });

    const query =`
    INSERT INTO public.users ("name", age, address, additional_info)
    VALUES ${placeholders.join(',')}
    `;

    await pool.query(query, values);
}

async function getAgeDistribution() {
    const query = `
    SELECT 
      SUM(CASE WHEN age < 20 THEN 1 ELSE 0 END) AS under_20,
      SUM(CASE WHEN age BETWEEN 20 AND 40 THEN 1 ELSE 0 END) AS between_20_40,
      SUM(CASE WHEN age BETWEEN 40 AND 60 THEN 1 ELSE 0 END) AS between_40_60,
      SUM(CASE WHEN age > 60 THEN 1 ELSE 0 END) AS over_60
    FROM public.users;
    `;

    const { rows } = await pool.query(query);
    return rows[0];
}


function buildStats(dist){
    // const total = Number(dist.total) || 0;
    const total = (Number(dist.under_20) || 0) + (Number(dist.between_20_40) || 0) + (Number(dist.between_40_60) || 0) + (Number(dist.over_60) || 0);
    if(total === 0){
        return { total: 0, groups: {} };
    }

    const pct = (count) => 
        Number(((Number(count || 0)/ total) * 100).toFixed(2));

    return {
        total,
        groups : [
            {label : ' < 20', percent: pct(dist.under_20) },
            {label : '20 - 40', percent: pct(dist.between_20_40) },
            {label : '40 - 60', percent: pct(dist.between_40_60) },
            {label : ' > 60', percent: pct(dist.over_60)},
        ],
    };

}


function printAgeDistribution(dist){
    const stats = buildStats(dist);

    console.log('\n Age-Group % Distribution');
    console.log('------------------------');

    if(stats.total === 0){
        console.log('No records imported.');
        return;
    }

    stats.groups.forEach( (g) => {
        console.log(` ${g.label.padEnd(8)} : ${g.percent}%`);
    });
}

module.exports = { runImport };