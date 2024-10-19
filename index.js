const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/recipes', async (req, res) => {
    const { title, making_time, serves, ingredients, cost } = req.body;
    const { data, error } = await supabase
        .from('recipes')
        .insert([{ title, making_time, serves, ingredients, cost }]);
    if (error) {
        return res.status(400).json({ message: "Recipe creation failed!", error: error.message });
    } else {
      return res.json({ message: "Recipe successfully created!", recipe: data });
    }
});

app.get('/recipes', async (req, res) => {
  console.log("this is running")
    const { data, error } = await supabase
        .from('recipes')
        .select('*');
    if (error) {
        return res.status(400).json({ error: error.message});
    } else {
      return res.json({ recipes: data });
    }
});

app.get('/recipes/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', req.params.id)
        .single();
    if (error) {
        return res.status(404).json({ message: "No recipe found", error: error.message });
    } else {
      res.json({ message: "Recipe details by id", recipe: data });
    }
});

app.patch('/recipes/:id', async (req, res) => {
    const { title, making_time, serves, ingredients, cost } = req.body;
    const { data, error } = await supabase
        .from('recipes')
        .update({ title, making_time, serves, ingredients, cost })
        .eq('id', req.params.id);
    if (error) {
        return res.status(400).json({ message: "Update failed", error: error.message });
    } else {
      return res.json({ message: "Recipe successfully updated!", recipe: data });
    }
});

app.delete('/recipes/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', req.params.id)
        .single();

    if (error) {
        return res.status(404).json({ message: "No recipe found", error: error.message });
    } else {
      return res.json({ message: "Recipe successfully removed!" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
