function compareSchemas() {
    const text = document.getElementById("schemaText").value;
    const result = parseSchemas(text);
    if (result) {
        displayResult(result);
    }
}

function parseSchemas(text) {
    const oldSchemaMatch = text.match(/oldSchema=FoundrySchema\{fieldSchemaList=\[(.*?)\], dataFrameReaderClass/s);
    const newSchemaMatch = text.match(/newSchema=FoundrySchema\{fieldSchemaList=\[(.*?)\], dataFrameReaderClass/s);

    if (!oldSchemaMatch || !newSchemaMatch) {
        alert("Invalid input. Please ensure the text contains both old and new schema definitions.");
        return null;
    }

    const oldSchema = parseFields(oldSchemaMatch[1]);
    const newSchema = parseFields(newSchemaMatch[1]);

    const added = newSchema.filter(field => !oldSchema.some(oldField => oldField.name === field.name));
    const removed = oldSchema.filter(field => !newSchema.some(newField => newField.name === field.name));
    const modified = newSchema.filter(field => {
        const oldField = oldSchema.find(oldField => oldField.name === field.name);
        return oldField && JSON.stringify(oldField) !== JSON.stringify(field);
    });

    return { added, removed, modified };
}

function parseFields(fieldsText) {
    return fieldsText.split('FoundryFieldSchema{').slice(1).map(fieldText => {
        const nameMatch = fieldText.match(/name: Optional\[(.*?)\]/);
        const typeMatch = fieldText.match(/type: (\w+)/);
        const nullableMatch = fieldText.match(/nullable: (\w+)/);
        const userDefinedTypeClassMatch = fieldText.match(/userDefinedTypeClass: (\w+)/);

        return {
            name: nameMatch ? nameMatch[1] : null,
            type: typeMatch ? typeMatch[1] : null,
            nullable: nullableMatch ? nullableMatch[1] : null,
            userDefinedTypeClass: userDefinedTypeClassMatch ? userDefinedTypeClassMatch[1] : null
        };
    });
}

function displayResult(result) {
    document.getElementById("result").style.display = "block";

    const addedTable = document.getElementById("addedTable");
    const removedTable = document.getElementById("removedTable");
    const modifiedTable = document.getElementById("modifiedTable");

    populateTable(addedTable, result.added);
    populateTable(removedTable, result.removed);
    populateTable(modifiedTable, result.modified);
}

function populateTable(table, data) {
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Nullable</th>
            <th>User Defined Type Class</th>
        </tr>
    `;

    data.forEach(field => {
        const row = table.insertRow();
        row.insertCell(0).textContent = field.name;
        row.insertCell(1).textContent = field.type;
        row.insertCell(2).textContent = field.nullable;
        row.insertCell(3).textContent = field.userDefinedTypeClass;
    });
}
