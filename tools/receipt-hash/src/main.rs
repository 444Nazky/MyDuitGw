use sha2::{Digest, Sha256};
use std::{env, fs, process};

fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();

    if args.first().map(String::as_str) == Some("--verify") {
        if args.len() != 3 {
            eprintln!("Usage: receipt-hash --verify <sha256> <file>");
            process::exit(2);
        }
        let expected = args[1].to_ascii_lowercase();
        let bytes = match fs::read(&args[2]) {
            Ok(bytes) => bytes,
            Err(error) => {
                eprintln!("{}: {error}", args[2]);
                process::exit(1);
            }
        };
        let actual = sha256_hex(&bytes);
        if actual == expected {
            println!("OK {}", args[2]);
        } else {
            eprintln!("MISMATCH {}: expected {expected}, got {actual}", args[2]);
            process::exit(1);
        }
        return;
    }

    if args.is_empty() {
        eprintln!("Usage: receipt-hash <file>... | --verify <sha256> <file>");
        process::exit(2);
    }

    for path in args {
        match fs::read(&path) {
            Ok(bytes) => println!("{}  {}  {}", sha256_hex(&bytes), bytes.len(), path),
            Err(error) => {
                eprintln!("{path}: {error}");
                process::exit(1);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::sha256_hex;

    #[test]
    fn hashes_known_text() {
        assert_eq!(
            sha256_hex(b"abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn hashes_empty_input() {
        assert_eq!(
            sha256_hex(b""),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
    }
}
