import logging
import sys
from typing import Optional


class Logger:
    def __init__(
        self,
        name: str,
        level: int = logging.INFO,
        log_format: Optional[str] = None,
    ):
        """
        name: usually __name__ from the calling module
        level: logging level (INFO, DEBUG, etc)
        log_format: override default format if needed
        """
        self.logger = logging.getLogger(name)

        if self.logger.handlers:
            return

        self.logger.setLevel(level)

        handler = logging.StreamHandler(sys.stdout)

        formatter = logging.Formatter(
            log_format
            or (
                "%(asctime)s | %(levelname)-8s | "
                "%(name)s | %(message)s"
            )
        )

        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.propagate = False

    def get(self) -> logging.Logger:
        return self.logger
