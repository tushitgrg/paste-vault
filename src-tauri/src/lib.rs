

use rusqlite::{params, Connection};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use clipboard::{ClipboardContext, ClipboardProvider};
use std::{thread, time::Duration};
use tauri::State;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
 
    let conn = create_database(); 
    let conn = Arc::new(Mutex::new(conn));

    tauri::Builder::default()
        .manage(conn.clone()) 
        .setup(move |_app| {
            let conn = conn.clone(); 
            std::thread::spawn(move || { 
                monitor_clipboard(conn);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![load_clipboard_history,delete_clipboard_entry,delete_all])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize, Deserialize)]
struct ClipboardEntry {
    id:i64,
    content: String,
    timestamp: String,
}

#[tauri::command]
fn load_clipboard_history(conn: State<'_, Arc<Mutex<Connection>>>) -> Vec<ClipboardEntry> {
    let conn = conn.lock().unwrap(); 
    let mut stmt = conn.prepare("SELECT id, content, timestamp FROM clipboard_history ORDER BY timestamp DESC").expect("Failed to prepare statement");
    
    let clipboard_entries = stmt.query_map([], |row| {
        Ok(ClipboardEntry {
            id: row.get(0)?,
            content: row.get(1)?,
            timestamp: row.get(2)?,
        })
    }).expect("Failed to query clipboard history");

    clipboard_entries.collect::<Result<Vec<_>, _>>().expect("Failed to collect entries")
}

fn monitor_clipboard(conn: Arc<Mutex<Connection>>) {
    let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
    let mut last_clipboard_content = String::new();

    loop {
        match ctx.get_contents() {
            Ok(new_content) => {
                
                if new_content != last_clipboard_content && new_content!="data" {
                    last_clipboard_content = new_content.clone();
                 
                    save_clipboard_entry(&conn, &new_content);
                }
            }
            Err(e) => {
                eprintln!("Error accessing clipboard: {:?}", e); 
            }
        }
        thread::sleep(Duration::from_secs(1));
    }
}
#[tauri::command]
fn delete_clipboard_entry(id:i64, conn: State<'_, Arc<Mutex<Connection>>>){
   
    let conn = conn.lock().unwrap(); 
    conn.execute("DELETE FROM clipboard_history where id = ?1", params![id]).expect("Failed to delete from database");

}
#[tauri::command]
fn delete_all(conn: State<'_, Arc<Mutex<Connection>>>){
    println!("dddddd");
    let conn = conn.lock().unwrap(); 
    conn.execute("DELETE FROM clipboard_history", params![]).expect("failed");
}

fn save_clipboard_entry(conn: &Arc<Mutex<Connection>>, content: &str) {

    let conn = conn.lock().unwrap(); 
   
   conn.execute(
    "INSERT INTO clipboard_history (content) 
     SELECT ?1 
     WHERE NOT EXISTS (
         SELECT 1 FROM clipboard_history WHERE content = ?1
     )",
    params![content],
).expect("Failed to insert into database");
}

fn create_database() -> Connection {
    let conn = Connection::open("clipboard_history.db").expect("Failed to open database");


    conn.execute(
        "CREATE TABLE IF NOT EXISTS clipboard_history (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).expect("Failed to create table");

    conn
}
