// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  let _ = fix_path_env::fix(); 
  paste_vault_lib::run();

  
}



// JSON example - create a file if it doesn't exist

