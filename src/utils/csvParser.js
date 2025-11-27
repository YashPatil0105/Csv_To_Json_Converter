function parseCsvLine(line){
    const result = [];
    let current = '';
    let inQuotes = false;

    for(let i = 0 ; i < line.length; i++){
        const ch = line[i];

        if( ch === '"' ){
            if(inQuotes && line[i + 1] === '"'){
                current += '"';
                i++;
            }else{
                inQuotes = !inQuotes;
            }
        }else if( ch === ',' && !inQuotes ){
            result.push(current.trim());
            current = '';
        }else{
            current += ch;
        }

    }

    result.push(current.trim());
    return result;
}

module.exports = { parseCsvLine };